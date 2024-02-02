// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React from 'react';
import Link from 'next/link';
import { RightArrowOutlined } from '@next-common/ui-components/CustomIcons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import NoAssetsSVG from '@next-common/assets/icons/no-transaction-home.svg';
import formatBalance from '@next-evm/utils/formatBalance';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import { currencyProperties } from '@next-common/global/currencyConstants';

ChartJS.register(ArcElement, Tooltip, Legend);

const TopAssetsCard = ({ className }: { className?: string }) => {
	const { organisationBalance } = useMultisigAssetsContext();
	const { currency, allCurrencyPrices } = useGlobalCurrencyContext();
	const dataArray =
		organisationBalance &&
		organisationBalance?.tokens &&
		Object.keys(organisationBalance.tokens)?.length > 0 &&
		Object.keys(organisationBalance.tokens)?.map((item) => {
			const balance = organisationBalance.tokens[item].balance_token;
			const balanceUSD = organisationBalance.tokens[item].balance_usd;
			const { name } = organisationBalance.tokens[item];
			const { tokenSymbol } = organisationBalance.tokens[item];
			return {
				balance: Number(balance),
				balance_usd: Number(balanceUSD),
				tokenName: name,
				tokenSymbol
			};
		});
	const sortedData = dataArray
		?.sort((a, b) => a.balance - b.balance)
		?.reverse()
		?.filter((_, i) => i < 4);
	console.log('data array', sortedData);
	const data = {
		labels: sortedData?.map(
			(item) =>
				`${item?.tokenSymbol} (${formatBalance(
					Number(item?.balance_usd) * Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
				)} ${allCurrencyPrices[currencyProperties[currency].symbol]?.code})`
		),
		datasets: [
			{
				label: 'No. of Tokens',
				data: sortedData?.map((item) => item?.balance),
				backgroundColor: ['#392A74', '#58409B', '#9F69C9', '#DDB4FC'],
				borderWidth: 0,
				cutout: 67,
				legend: {
					position: 'right'
				}
				// rotation: -180
			}
		]
	};

	return (
		<div>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Assets</h2>
				<div className='flex items-center justify-center text-primary cursor-pointer'>
					<Link
						href='/assets'
						className='mx-2 text-primary text-sm'
					>
						View All
					</Link>
					<RightArrowOutlined />
				</div>
			</div>
			{sortedData?.[0]?.balance === 0 ? (
				<div
					className={`${className} bg-bg-main relative flex flex-col justify-around rounded-xl p-8 h-[17rem] shadow-lg scale-90 w-[111%] origin-top-left`}
				>
					<div className='flex flex-col gap-y-2 items-center justify-center'>
						<NoAssetsSVG />
						<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
					</div>
				</div>
			) : (
				<div
					className={`${className} bg-bg-main relative flex flex-col justify-around rounded-xl p-8 shadow-lg scale-90 w-[111%] origin-top-left`}
				>
					<div className='h-[190px] w-[400px]'>
						<Doughnut
							data={data}
							options={{
								maintainAspectRatio: false,
								plugins: {
									legend: {
										position: 'right',
										labels: {
											usePointStyle: true,
											boxHeight: 5,
											boxWidth: 5,
											color: '#ffffff',
											font: {
												size: 14
											}
										}
									}
								}
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default TopAssetsCard;
