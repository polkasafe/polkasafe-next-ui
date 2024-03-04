/* eslint-disable sort-keys */
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import formatBalance from '@next-substrate/utils/formatBalance';
import React, { useState } from 'react';
import {
	Chart as ChartJS,
	LineElement,
	BarElement,
	LinearScale,
	PointElement,
	TimeScale,
	Tooltip,
	Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import dayjs, { Dayjs } from 'dayjs';
import { ETxnType, ITreasuryTxns } from '@next-common/types';
import { chainProperties } from '@next-common/global/networkConstants';
import { Segmented } from 'antd';

ChartJS.register(LineElement, BarElement, LinearScale, PointElement, TimeScale, Tooltip, Legend);

interface ITokenData {
	[tokenSymbol: string]: {
		balance_token: number;
		timestamp: string;
		type: ETxnType;
	}[];
}

enum ETokenTypeFilter {
	USD = 'USD',
	TOKENS = 'TOKENS'
}

const BalanceHistory = ({
	incomingTransactions,
	outgoingTransactions,
	id,
	startDate,
	endDate
}: {
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
	id: string;
	startDate: null | Dayjs;
	endDate: null | Dayjs;
}) => {
	const { organisationBalance, allAssets } = useMultisigAssetsContext();

	const [tokenTypeFilter, setTokenTypeFilter] = useState<ETokenTypeFilter>(ETokenTypeFilter.USD);

	const sortedIncomingTxns = incomingTransactions.sort((a, b) =>
		dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
	);
	const sortedOutgoingTxns = outgoingTransactions.sort((a, b) =>
		dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
	);

	const filterredIncomingTxns =
		startDate && endDate
			? sortedIncomingTxns.filter(
					(item) => dayjs(item.timestamp).isBefore(dayjs(endDate)) && dayjs(item.timestamp).isAfter(dayjs(startDate))
			  )
			: sortedIncomingTxns;

	const filterredOutgoingTxns =
		startDate && endDate
			? sortedOutgoingTxns.filter(
					(item) => dayjs(item.timestamp).isBefore(dayjs(endDate)) && dayjs(item.timestamp).isAfter(dayjs(startDate))
			  )
			: sortedOutgoingTxns;

	const data = {
		datasets: [
			{
				borderColor: '#5C7AE6',
				data: filterredIncomingTxns?.map((item) => Number(item?.balance_usd)),
				label: 'Incoming',
				legend: {
					position: 'right'
				},
				tension: 0.3,
				pointBackgroundColor: '#5C7AE6',
				pointBorderColor: 'white',
				radius: 0,
				hitRadius: 40,
				hoverRadius: 8
			},
			{
				borderColor: '#3D3C41',
				data: filterredOutgoingTxns?.map((item) => Number(item?.balance_usd)),
				label: 'Outgoing',
				legend: {
					position: 'right'
				},
				tension: 0.3,
				radius: 0,
				hitRadius: 40,
				hoverRadius: 8
			}
		],
		labels: sortedIncomingTxns?.map((item) => item.timestamp)
	};

	const tokensData: ITokenData = {};

	sortedIncomingTxns.forEach((item) => {
		if (tokensData[chainProperties[item.network].tokenSymbol]) {
			tokensData[chainProperties[item.network].tokenSymbol].push({
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				timestamp: item.timestamp,
				type: item.type
			});
			return;
		}
		tokensData[chainProperties[item.network].tokenSymbol] = [
			{
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				timestamp: item.timestamp,
				type: item.type
			}
		];
	});

	sortedOutgoingTxns.forEach((item) => {
		if (tokensData[chainProperties[item.network].tokenSymbol]) {
			tokensData[chainProperties[item.network].tokenSymbol].push({
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				timestamp: item.timestamp,
				type: item.type
			});
			return;
		}
		tokensData[chainProperties[item.network].tokenSymbol] = [
			{
				balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
				timestamp: item.timestamp,
				type: item.type
			}
		];
	});

	console.log('tokenData', tokensData);

	const barChartData = {
		datasets: Object.keys(tokensData).map((item) => ({
			data: tokensData[item].map((token) => token.balance_token),
			label: item,
			backgroundColor: '#5C7AE6',
			borderRadius: 10,
			barThickness: 20
		})),
		labels: sortedIncomingTxns?.map((item) => item.timestamp)
	};

	return (
		<>
			<div className='mb-4'>
				<p className='text-xs text-text_secondary mb-1'>Total Balance</p>
				<p className='text-[22px] font-bold text-white'>
					$ {formatBalance(Number(allAssets[id]?.fiatTotal || organisationBalance?.total))}
				</p>
			</div>
			<Segmented
				size='small'
				onChange={(value) => setTokenTypeFilter(value as ETokenTypeFilter)}
				className='bg-transparent text-text_secondary border border-text_secondary p-1 mb-3'
				value={tokenTypeFilter}
				options={[ETokenTypeFilter.USD, ETokenTypeFilter.TOKENS]}
			/>
			<div>
				<p className='text-xs text-white font-medium'>Balance History</p>
			</div>
			<div className='h-[300px]'>
				{tokenTypeFilter === ETokenTypeFilter.USD ? (
					<Line
						data={data}
						options={{
							maintainAspectRatio: false,
							plugins: {
								legend: {
									align: 'end',
									labels: {
										boxHeight: 0,
										color: '#ffffff',
										font: {
											size: 14
										}
									}
								}
							},
							scales: {
								x: {
									time: {
										unit: 'month'
									},
									type: 'time'
								},
								y: {
									beginAtZero: true,
									ticks: {
										callback(value) {
											return `$${formatBalance(value)}`;
										}
									}
								}
							}
						}}
					/>
				) : (
					<Bar
						data={barChartData}
						options={{
							maintainAspectRatio: false,
							plugins: {
								legend: {
									align: 'end',
									labels: {
										boxHeight: 0,
										color: '#ffffff',
										font: {
											size: 14
										}
									}
								}
							},
							scales: {
								x: {
									time: {
										unit: 'month'
									},
									type: 'time',
									stacked: true
								},
								y: {
									beginAtZero: true,
									stacked: true
								}
							}
						}}
					/>
				)}
			</div>
		</>
	);
};

export default BalanceHistory;
