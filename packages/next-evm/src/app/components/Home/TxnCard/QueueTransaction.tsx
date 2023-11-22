// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined } from '@ant-design/icons';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ArrowUpRightIcon } from '@next-common/ui-components/CustomIcons';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { getTransactionDetails, TransactionData } from '@safe-global/safe-gateway-typescript-sdk';
import { StaticImageData } from 'next/image';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import formatBalance from '@next-evm/utils/formatBalance';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

interface ITransactionProps {
	callHash: string;
	callData: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const QueueTransaction = ({ callHash, callData }: ITransactionProps) => {
	const { network } = useGlobalApiContext();
	const { allAssets } = useMultisigAssetsContext();
	const { gnosisSafe } = useGlobalUserDetailsContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [amount, setAmount] = useState(0);

	const [tokenDetailsArray, setTokenDetailsArray] = useState<
		{ tokenSymbol: string; tokenDecimals: number; tokenLogo: StaticImageData | string; tokenAddress: string }[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);

	const getTxDetails = useCallback(async () => {
		try {
			setLoading(true);
			const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), callHash);
			setTxData(txDetails.txData);
			setTxInfo(txDetails.txInfo);
			setLoading(false);
		} catch (err) {
			console.log(err);
			setLoading(false);
		}
	}, [callHash, network]);

	useEffect(() => {
		getTxDetails();
	}, [getTxDetails]);

	useEffect(() => {
		if (!callData) return;
		gnosisSafe.safeService
			.decodeData(callData)
			.then((res) => setDecodedCallData(res))
			.catch((e) => console.log(e));
	}, [callData, gnosisSafe]);

	useEffect(() => {
		if (decodedCallData && decodedCallData?.method === 'multiSend') {
			if (txData && txData.addressInfoIndex && Object.keys(txData.addressInfoIndex)?.length > 0) {
				const tokenContractAddressArray: string[] = decodedCallData?.parameters?.[0]?.valueDecoded?.map(
					(item: any) => item?.to
				);

				const realContractAddresses = Object.keys(txData.addressInfoIndex);
				const tokenDetails = [];
				tokenContractAddressArray.forEach((item) => {
					if (realContractAddresses.includes(item)) {
						const assetDetails = allAssets.find((asset) => asset.tokenAddress === item);
						tokenDetails.push({
							tokenAddress: assetDetails?.tokenAddress || '',
							tokenDecimals: assetDetails?.token_decimals || chainProperties[network].decimals,
							tokenLogo: assetDetails?.logoURI || chainProperties[network].logo,
							tokenSymbol: assetDetails?.name || chainProperties[network].tokenSymbol
						});
					} else {
						tokenDetails.push({
							tokenAddress: '',
							tokenDecimals: chainProperties[network].decimals,
							tokenLogo: chainProperties[network].logo,
							tokenSymbol: chainProperties[network].tokenSymbol
						});
					}
				});
				setTokenDetailsArray(tokenDetails);
			} else {
				setTokenDetailsArray([
					{
						tokenAddress: '',
						tokenDecimals: chainProperties[network].decimals,
						tokenLogo: chainProperties[network].logo,
						tokenSymbol: chainProperties[network].tokenSymbol
					}
				]);
			}

			const amountsArray = decodedCallData?.parameters?.[0]?.valueDecoded?.map(
				(item: any) => item?.dataDecoded?.parameters?.[1]?.value
			);
			const totalAmount: number = amountsArray?.reduce((sum: number, a: string) => {
				return sum + Number(a);
			}, 0);
			setAmount(totalAmount);
		}
	}, [allAssets, decodedCallData, network, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

	return (
		<Link
			href={`/transactions?tab=Queue#${callHash}`}
			className='flex items-center pb-2 mb-2'
		>
			<div className='flex flex-1 items-center'>
				<div className='bg-[#FF79F2] text-[#FF79F2] bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
					<ArrowUpRightIcon />
				</div>
				<div className='ml-3'>
					<h1 className='text-md text-white'>
						<span>Txn: {shortenAddress(callHash)}</span>
					</h1>
					<p className='text-text_secondary text-xs'>In Process...</p>
				</div>
			</div>

			<div>
				<h1 className='text-md text-white'>
					{loading ? (
						<Skeleton
							paragraph={{ rows: 0, width: 150 }}
							active
						/>
					) : isMultiTokenTx ? (
						<div className='flex gap-x-2 col-span-2'>
							{tokenDetailsArray.map((item) => (
								<ParachainIcon
									tooltip={item.tokenSymbol}
									src={item.tokenLogo}
								/>
							))}
						</div>
					) : (
						<p className='col-span-2 flex items-center gap-x-[6px]'>
							<ParachainIcon
								src={
									decodedCallData?.method === 'multiSend'
										? tokenDetailsArray[0]?.tokenLogo
										: txInfo?.transferInfo?.logoUri || chainProperties[network].logo
								}
							/>
							<span className='font-normal text-xs leading-[13px] text-failure'>
								{formatBalance(
									ethers.utils.formatUnits(
										decodedCallData?.method === 'multiSend' ? amount : txInfo?.transferInfo?.value || 0,
										decodedCallData?.method === 'multiSend'
											? tokenDetailsArray[0]?.tokenDecimals
											: txInfo?.transferInfo?.decimals || chainProperties[network].decimals
									)
								)}{' '}
								{decodedCallData?.method === 'multiSend'
									? tokenDetailsArray[0]?.tokenSymbol
									: txInfo?.transferInfo?.tokenSymbol || chainProperties[network].tokenSymbol}
							</span>
						</p>
					)}
				</h1>
			</div>

			<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
				<ArrowRightOutlined />
			</div>
		</Link>
	);
};

export default QueueTransaction;