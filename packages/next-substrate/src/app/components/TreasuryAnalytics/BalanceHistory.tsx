/* eslint-disable sort-keys */
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import formatBalance from '@next-substrate/utils/formatBalance';
import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ETxnType, ITreasuryTxns } from '@next-common/types';
import { chainProperties } from '@next-common/global/networkConstants';
import LineChart from './LineChart';

interface ITokenData {
	[tokenSymbol: string]: {
		balance_token: number;
		timestamp: string;
		type: ETxnType;
	}[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

	// const barChartData = {
	// datasets: Object.keys(tokensData).map((item) => ({
	// data: tokensData[item].map((token) => token.balance_token),
	// label: item,
	// backgroundColor: '#5C7AE6',
	// borderRadius: 10,
	// barThickness: 20
	// })),
	// labels: sortedIncomingTxns?.map((item) => item.timestamp)
	// };

	return (
		<>
			<div className='mb-4'>
				<p className='text-xs text-text_secondary mb-1'>Total Balance</p>
				<p className='text-[22px] font-bold text-white'>
					$ {formatBalance(Number(allAssets[id.split('_')[0]]?.fiatTotal || organisationBalance?.total))}
				</p>
			</div>
			{/* <Segmented
				size='small'
				onChange={(value) => setTokenTypeFilter(value as ETokenTypeFilter)}
				className='bg-transparent text-text_secondary border border-text_secondary p-1 mb-3'
				value={tokenTypeFilter}
				options={[ETokenTypeFilter.USD, ETokenTypeFilter.TOKENS]}
			/> */}
			<div>
				<p className='text-xs text-white font-medium'>Balance History</p>
			</div>
			<div className='h-[300px] w-full'>
				<LineChart
					days={endDate.diff(startDate, 'd')}
					incomingTransactions={filterredIncomingTxns}
					outgoingTransactions={filterredOutgoingTxns}
				/>
			</div>
		</>
	);
};

export default BalanceHistory;
