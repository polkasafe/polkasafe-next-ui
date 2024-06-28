'use client';

import { networks } from '@next-common/global/networkConstants';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { useSearchParams } from 'next/navigation';
import DashboardCardWatch from '@next-substrate/app/components/WatchMultisig/DashboardCardWatch';
import React, { useEffect, useState } from 'react';
import { IAsset } from '@next-common/types';
import getAssetsForAddress from '@next-substrate/utils/getAssetsForAddress';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import Loader from '@next-common/ui-components/Loader';
import SignatoriesList from '@next-substrate/app/components/WatchMultisig/SignatoriesList';
import TransactionsTable from '@next-substrate/app/components/WatchMultisig/TransactionsTable';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const WatchMultisig = () => {
	const searchParams = useSearchParams();

	const multisigAddress = searchParams.get('multisig');
	const network = searchParams.get('network');

	const [multisigInfo, setMultisigInfo] = useState<{ signatories: string[]; threshold: number }>();

	const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
	const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

	const [assets, setAssets] = useState<IAsset[]>([]);

	const [fiatTotal, setFiatTotal] = useState<number>(0);

	const { tokensUsdPrice } = useGlobalCurrencyContext();

	const [refetch, setRefetch] = useState<boolean>(false);

	useEffect(() => {
		const fetchMultisigInfo = async () => {
			if (!multisigAddress || !network) return;

			if (!Object.values(networks).includes(network)) {
				return;
			}

			setLoadingInfo(true);
			const response = await fetch(`https://${network}.api.subscan.io/api/v2/scan/search`, {
				body: JSON.stringify({
					key: multisigAddress
				}),
				headers: SUBSCAN_API_HEADERS,
				method: 'POST'
			});

			const responseJSON = await response.json();

			setLoadingInfo(false);

			if (responseJSON && responseJSON?.data && responseJSON?.data?.account && responseJSON?.data?.account?.multisig) {
				const info = responseJSON?.data?.account?.multisig;
				const signatories: string[] = info?.multi_account_member?.map((item: any) => item?.address);
				const threshold: number = info?.threshold;
				if (signatories && threshold) {
					setMultisigInfo({
						signatories,
						threshold
					});
				}
			}
		};
		fetchMultisigInfo();
	}, [multisigAddress, network, refetch]);

	useEffect(() => {
		const fetchAssets = async () => {
			if (!multisigAddress || !network) return;

			if (!Object.values(networks).includes(network)) {
				return;
			}

			setLoadingAssets(true);
			const { data, error } = await getAssetsForAddress(
				multisigAddress,
				network,
				parseFloat(tokensUsdPrice[network]?.value?.toString())?.toFixed(2)
			);

			if (data && !error) {
				const total = data.reduce((sum, item) => {
					return sum + Number(item.balance_usd);
				}, 0);
				setFiatTotal(total);
				setAssets(data);
			}
			setLoadingAssets(false);
		};
		if (multisigInfo) {
			fetchAssets();
		}
	}, [multisigAddress, multisigInfo, network, tokensUsdPrice, refetch]);

	return (
		<div>
			{loadingInfo ? (
				<Loader />
			) : (
				<section className='flex flex-col'>
					<Tooltip title='Refresh'>
						<Button
							size='small'
							onClick={() => setRefetch((prev) => !prev)}
							disabled={loadingAssets || loadingInfo}
							className='text-primary bg-highlight outline-none border-none font-medium text-xs ml-auto'
						>
							<SyncOutlined
								spin={loadingAssets || loadingInfo}
								className='text-primary'
							/>
						</Button>
					</Tooltip>
					<div className='mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto'>
						<div className='col-start-1 col-end-13 lg:col-end-10'>
							<DashboardCardWatch
								multisigAddress={multisigAddress}
								network={network}
								fiatTotal={fiatTotal}
								loadingAssets={loadingAssets}
								signatories={multisigInfo?.signatories?.length || 0}
								threshold={multisigInfo?.threshold || 0}
								numberOfTokens={assets?.length || 0}
							/>
						</div>
						<div className='col-start-1 col-end-13 lg:col-start-10 h-full'>
							<SignatoriesList
								signatories={multisigInfo?.signatories || []}
								network={network}
							/>
						</div>
					</div>
					<TransactionsTable
						assets={assets}
						multisigAddress={multisigInfo && assets ? multisigAddress : ''}
						network={network}
					/>
				</section>
			)}
		</div>
	);
};

export default WatchMultisig;
