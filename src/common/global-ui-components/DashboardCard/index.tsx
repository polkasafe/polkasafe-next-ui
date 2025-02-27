'use client';

import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import EyeIcon from '@common/assets/icons/eye.svg';
import { getCurrencySymbol } from '@common/utils/getCurrencySymbol';
import SelectCurrency from '@common/global-ui-components/SelectCurrency';
import { useDashboardContext } from '@common/context/DashboarcContext';
import { Skeleton } from 'antd';
import { useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { ENetwork } from '@common/enum/substrate';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

function DashboardCard() {
	const { assets, currency } = useDashboardContext();
	const proxyMultiSigAssets = [...(assets || []), ...(assets || []).map((a) => a.proxy || []).flat()];
	const tokenBalance: any = [];

	const getTotalBalance = () => {
		try {
			const totalBalance = proxyMultiSigAssets?.reduce((ac, asset) => {
				const supportedTokens = (networkConstants[asset.network] as any).supportedTokens || [];
				if (supportedTokens.length > 0) {
					supportedTokens.forEach((token: { symbol: string }) => {
						tokenBalance.push((asset as any)[token.symbol.toLowerCase()]);
					});
				}
				return (
					ac +
					Number(
						asset?.allCurrency?.[
							asset.network === ENetwork.POLKADOT_ASSETHUB
								? ENetwork.POLKADOT
								: asset.network === ENetwork.KUSAMA_ASSETHUB
									? ENetwork.KUSAMA
									: asset.network
						]?.[currency.toLowerCase()]?.toFixed(2) || 0
					)
				);
			}, 0);

			const tokenBalanceValue =
				tokenBalance.reduce((ac: number, token: any) => {
					return ac + Number(token?.free) * Number(token?.[currency?.toUpperCase()]);
				}, 0) || 0;

			return totalBalance + tokenBalanceValue;
		} catch (error) {
			console.log('error in getTotalBalance', error);
		}
	};

	const TOTAL_VALUE = getTotalBalance() || 0;

	const symbol = getCurrencySymbol(currency);
	const show = (localStorage.getItem('showBalance') || 'yes') as 'yes' | 'no';
	const [showBalance, setShowBalance] = useState<'yes' | 'no'>(show);
	return (
		<div className='overflow-hidden relative'>
			<div className='h-[150px] w-[150px] rounded-full absolute -bottom-20 left-[10%] z-10 bg-circle-1-gradient' />
			<div className='h-[220px] w-[220px] rounded-full absolute top-0 left-[20%] z-10 bg-circle-2-gradient' />
			<div className='h-[120px] w-[180px] rounded-full absolute top-10 left-[45%] z-10 bg-circle-3-gradient' />
			<div className='h-[270px] w-[270px] rounded-full absolute -bottom-[250px] right-0 z-10 bg-circle-4-gradient' />
			<div className='relative rounded-[20px] z-20 bg-transparent backdrop-blur-3xl border border-[#505050] px-7 p-6 text-white shadow-lg w-full flex flex-col gap-5'>
				<div className='flex flex-col gap-2'>
					<div className='flex justify-between items-center'>
						<Typography
							variant={ETypographyVariants.p}
							className='text-sm text-text-secondary capitalize'
						>
							Total Balance
						</Typography>
						<SelectCurrency transparent />
					</div>
					<div className='flex gap-4 items-center'>
						<Typography
							variant={ETypographyVariants.p}
							className='text-4xl text-text-primary capitalize font-raleway'
						>
							{symbol}{' '}
							{showBalance === 'yes' ? (
								<span>
									{TOTAL_VALUE === null ? (
										<Skeleton.Button
											size='small'
											active
										/>
									) : (
										TOTAL_VALUE?.toFixed(2)
									)}
								</span>
							) : (
								'******'
							)}
						</Typography>
						<span
							onClick={() => {
								setShowBalance(showBalance === 'yes' ? 'no' : 'yes');
								localStorage.setItem('showBalance', showBalance === 'yes' ? 'no' : 'yes');
							}}
							className='cursor-pointer'
						>
							{showBalance === 'yes' ? (
								<EyeIcon />
							) : (
								<EyeOutlined style={{ fontSize: '24px', color: 'var(--text-secondary)' }} />
							)}
						</span>
					</div>
				</div>
				<div className='flex gap-3 items-center py-3'>
					{/* <Typography
						variant={ETypographyVariants.p}
						className='text-base text-text-success capitalize font-raleway'
					>
						{lastTransactionsValue > 0 ? '+' : '-'} {symbol}
						{Math.abs(lastTransactionsValue)}
					</Typography> */}
					{/* <Typography
						variant={ETypographyVariants.p}
						className='text-xs text-text-primary border-2 inline-block px-2 py-1 rounded-lg uppercase font-semibold'
					>
						24h
					</Typography> */}
				</div>
			</div>
		</div>
	);
}

export default DashboardCard;
