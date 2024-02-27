import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import formatBalance from '@next-substrate/utils/formatBalance';
import React from 'react';
import { Chart as ChartJS, LineElement, LinearScale, PointElement, TimeScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ITreasuryTxns } from '@next-substrate/context/HistoricalTransactionsContext';
import dayjs from 'dayjs';

ChartJS.register(LineElement, LinearScale, PointElement, TimeScale, Tooltip, Legend);

const BalanceHistory = ({
	incomingTransactions,
	outgoingTransactions,
	id
}: {
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
	id: string;
}) => {
	const { organisationBalance, allAssets } = useMultisigAssetsContext();

	console.log('multisg txns', id, incomingTransactions, outgoingTransactions);

	const sortedIncomingTxns = incomingTransactions.sort((a, b) =>
		dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
	);
	const sortedOutgoingTxns = outgoingTransactions.sort((a, b) =>
		dayjs(a.timestamp).isBefore(dayjs(b.timestamp)) ? -1 : 1
	);

	const data = {
		datasets: [
			{
				borderColor: '#1573FE',
				data: sortedIncomingTxns?.map((item) => Number(item?.balance_usd)),
				label: 'Incoming',
				legend: {
					position: 'right'
				},
				tension: 0.3
			},
			{
				borderColor: '#8B8B8B',
				data: sortedOutgoingTxns?.map((item) => Number(item?.balance_usd)),
				label: 'Outgoing',
				legend: {
					position: 'right'
				},
				tension: 0.3
			}
		],
		labels: sortedIncomingTxns?.map((item) => item.timestamp)
	};

	return (
		<div className='rounded-xl p-5 bg-bg-secondary gap-x-5'>
			<div className='mb-4'>
				<p className='text-sm text-text_secondary mb-3'>Total Balance</p>
				<p className='text-[25px] font-bold text-white'>
					$ {formatBalance(Number(allAssets[id]?.fiatTotal || organisationBalance?.total))}
				</p>
			</div>
			<div className='h-[300px]'>
				<Line
					data={data}
					options={{
						maintainAspectRatio: false,
						plugins: {
							legend: {
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
								beginAtZero: true
							}
						}
					}}
				/>
			</div>
		</div>
	);
};

export default BalanceHistory;
