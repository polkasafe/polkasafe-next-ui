/* eslint-disable sort-keys */
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import formatBalance from '@next-substrate/utils/formatBalance';
import React from 'react';
import { Chart as ChartJS, LineElement, LinearScale, PointElement, TimeScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ITreasuryTxns } from '@next-substrate/context/HistoricalTransactionsContext';
import dayjs, { Dayjs } from 'dayjs';

ChartJS.register(LineElement, LinearScale, PointElement, TimeScale, Tooltip, Legend);

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

	console.log('multisg txns', id, incomingTransactions, outgoingTransactions);

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

	return (
		<>
			<div className='mb-4'>
				<p className='text-sm text-text_secondary mb-2'>Total Balance</p>
				<p className='text-[25px] font-bold text-white'>
					$ {formatBalance(Number(allAssets[id]?.fiatTotal || organisationBalance?.total))}
				</p>
			</div>
			<div className='mb-4'>
				<p className='text-sm text-white font-medium'>Balance History</p>
			</div>
			<div className='h-[300px]'>
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
			</div>
		</>
	);
};

export default BalanceHistory;
