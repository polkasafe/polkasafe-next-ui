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
import { ethers } from 'ethers';
import NoAssetsSVG from '@next-common/assets/icons/no-transaction-home.svg';

ChartJS.register(ArcElement, Tooltip, Legend);

const TopAssetsCard = ({ className }: { className?: string }) => {
	const { organisationBalance } = useMultisigAssetsContext();
	const dataArray =
		organisationBalance &&
		organisationBalance?.tokens &&
		Object.keys(organisationBalance.tokens)?.length > 0 &&
		Object.keys(organisationBalance.tokens)?.map((item) => {
			const balance = organisationBalance.tokens[item].balance_token;
			const decimals = organisationBalance.tokens[item].tokenDecimals;
			const { name } = organisationBalance.tokens[item];
			const { tokenSymbol } = organisationBalance.tokens[item];
			return {
				balance: Number(ethers.utils.formatUnits(BigInt(balance), decimals)),
				tokenName: name,
				tokenSymbol
			};
		});
	const sortedData = dataArray?.sort((a, b) => a.balance - b.balance)?.reverse();
	console.log('data array', sortedData);
	const data = {
		labels: sortedData?.map((item) => item?.tokenSymbol),
		config: {
			cutout: 70
		},
		datasets: [
			{
				config: {
					cutout: 70
				},
				label: '# of Tokens',
				data: sortedData?.map((item) => item?.balance),
				backgroundColor: ['#392A74', '#58409B', '#9F69C9', '#DDB4FC'],
				borderWidth: 0,
				cutout: 50,
				legend: {
					position: 'right'
				}
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
			<div
				className={`${className} bg-bg-main flex flex-col justify-around rounded-xl p-8 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left`}
			>
				{sortedData?.[0]?.balance === 0 ? (
					<div className='flex flex-col gap-y-2 items-center justify-center'>
						<NoAssetsSVG />
						<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
					</div>
				) : (
					<Doughnut
						width={100}
						height={100}
						data={data}
						options={{
							plugins: {
								legend: {
									position: 'right',
									labels: {
										usePointStyle: true,
										boxHeight: 5,
										boxWidth: 5
									}
								}
							}
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default TopAssetsCard;
