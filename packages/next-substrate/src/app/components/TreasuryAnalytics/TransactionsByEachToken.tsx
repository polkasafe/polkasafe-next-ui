// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useEffect, useState } from 'react';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import NoAssetsSVG from '@next-common/assets/icons/no-transaction-home.svg';
import { ETxnType, ITreasuryTxns } from '@next-common/types';
import { chainProperties } from '@next-common/global/networkConstants';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { Dropdown } from 'antd';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ITokenData {
	[network: string]: {
		balance_token: number;
		balance_usd: number;
		tokenSymbol: string;
		type: ETxnType;
	}[];
}

const TransactionsByEachToken = ({
	className,
	incomingUSD,
	outgoingUSD,
	incomingTransactions,
	outgoingTransactions
}: {
	className?: string;
	incomingUSD: string;
	outgoingUSD: string;
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
}) => {
	const tokensData: ITokenData = {};

	incomingTransactions.forEach((item) => {
		if (tokensData[item.network]) {
			tokensData[item.network].push({
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
				type: item.type,
				tokenSymbol: chainProperties[item.network].tokenSymbol
			});
			return;
		}
		tokensData[item.network] = [
			{
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
				type: item.type,
				tokenSymbol: chainProperties[item.network].tokenSymbol
			}
		];
	});
	outgoingTransactions.forEach((item) => {
		if (tokensData[item.network]) {
			tokensData[item.network].push({
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
				type: item.type,
				tokenSymbol: chainProperties[item.network].tokenSymbol
			});
			return;
		}
		tokensData[item.network] = [
			{
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
				type: item.type,
				tokenSymbol: chainProperties[item.network].tokenSymbol
			}
		];
	});

	const [selectedToken, setSelectedToken] = useState<string>(Object.keys(tokensData)[0]);

	useEffect(() => {
		setSelectedToken(Object.keys(tokensData)[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const multisigOptions: ItemType[] = Object.keys(tokensData)?.map((item) => ({
		key: item,
		label: (
			<div className='flex items-center gap-x-2'>
				<ParachainIcon
					src={chainProperties[item].logo}
					size={10}
				/>
				<span>{chainProperties[item].tokenSymbol}</span>
			</div>
		)
	}));

	const tokenIncomingtxns = tokensData[selectedToken]?.filter((item) => item.type === ETxnType.INCOMING).length;
	const tokenOutgoingTxns = tokensData[selectedToken]?.filter((item) => item.type === ETxnType.OUTGOING).length;

	const diff = Math.abs(tokenIncomingtxns - tokenOutgoingTxns);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const backgroundCircle = {
		id: 'backgroundCircle',
		beforeDatasetsDraw(chart: any) {
			const { ctx } = chart;
			ctx.save();

			const xCoor = chart.getDatasetMeta(0).data[0].x;
			const yCoor = chart.getDatasetMeta(0).data[0].y;
			const { innerRadius } = chart.getDatasetMeta(0).data[0];
			const { outerRadius } = chart.getDatasetMeta(0).data[0];
			const width = outerRadius - innerRadius;
			const angle = Math.PI / 180;

			ctx.beginPath();
			ctx.lineWidth = width;
			ctx.strokeStyle = 'grey';
			ctx.arc(xCoor, yCoor, outerRadius - width / 2, 0, angle * 360, false);
			ctx.stroke();
		}
	};

	const data = {
		datasets: [
			{
				label: 'Outgoing Transactions',
				data: [tokenOutgoingTxns, diff],
				backgroundColor: ['#E63946', '#1B2028'],
				borderWidth: 10,
				cutout: 50,
				borderRadius: 10,
				borderColor: '#24272E'
			},
			{
				label: 'Incoming Transactions',
				data: [tokenIncomingtxns, diff],
				backgroundColor: ['#06D6A0', '#1B2028'],
				borderColor: '#24272E',
				borderWidth: 10,
				cutout: 50,
				borderRadius: 10
			}
		]
	};

	return (
		<div>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Token Flow</h2>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-1 bg-bg-secondary cursor-pointer min-w-[150px]'
					menu={{
						items: multisigOptions,
						onClick: (e) => {
							setSelectedToken(e.key);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<div className='flex items-center gap-x-2'>
							<ParachainIcon
								src={chainProperties[selectedToken]?.logo}
								size={10}
							/>
							<span className='text-xs'>{chainProperties[selectedToken]?.tokenSymbol}</span>
						</div>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
			{!tokensData ? (
				<div
					className={`bg-bg-main relative flex flex-col justify-around rounded-xl p-8 h-[17rem] shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<div className='flex flex-col gap-y-2 items-center justify-center'>
						<NoAssetsSVG />
						<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
					</div>
				</div>
			) : (
				<div
					className={`bg-bg-main relative flex items-center rounded-xl p-8 shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<div className='h-[190px] w-[400px]'>
						<Doughnut
							data={data}
							options={{
								maintainAspectRatio: false,
								plugins: {
									legend: {
										display: false
									}
								}
							}}
						/>
					</div>
					<div>
						<label className='text-text_secondary text-sm mb-2'>Incoming</label>
						<div className='text-success font-bold text-[25px] mb-3'>$ {incomingUSD}</div>
						<label className='text-text_secondary text-sm mb-2'>Outgoing</label>
						<div className='text-failure font-bold text-[25px]'>$ {outgoingUSD}</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TransactionsByEachToken;
