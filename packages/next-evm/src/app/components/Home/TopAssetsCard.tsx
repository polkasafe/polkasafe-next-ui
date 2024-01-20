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
import formatBalance from '@next-evm/utils/formatBalance';
import { ethers } from 'ethers';

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
				balance: Number(formatBalance(ethers.utils.formatUnits(BigInt(balance), decimals))),
				tokenName: name,
				tokenSymbol
			};
		});
	const sortedData = dataArray?.sort((a, b) => a.balance - b.balance)?.reverse();
	console.log('data array', sortedData);
	const data = {
		labels: sortedData?.map((item) => item.tokenSymbol),
		datasets: [
			{
				label: '# of Tokens',
				data: sortedData?.map((item) => item.balance),
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)'
				]
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
				<Doughnut
					width={100}
					height={100}
					data={data}
				/>
			</div>
		</div>
	);
};

export default TopAssetsCard;
