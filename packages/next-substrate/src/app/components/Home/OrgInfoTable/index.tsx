import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import dayjs from 'dayjs';
import { IQueueItem, ITransaction } from '@next-common/types';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import { useHistoricalTransactionsContext } from '@next-substrate/context/HistoricalTransactionsContext';
import MembersTable from './Members';
import TransactionHistory from './TransactionHistory';
import TransactionQueue from './TransactionQueue';

enum ETab {
	QUEUE,
	HISTORY,
	ASSETS,
	MEMBERS
}

const OrgInfoTable = ({ className }: { className?: string }) => {
	const [tab, setTab] = useState(ETab.HISTORY);

	const { activeOrg } = useActiveOrgContext();
	const { loadingAssets } = useMultisigAssetsContext();
	const { loadingTreasury } = useHistoricalTransactionsContext();
	const { wallets } = useWallets();
	const [pendingTxns, setPendingTxns] = useState<IQueueItem[]>([]);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);
	const [completedTransactions, setCompletedTransactions] = useState<ITransaction[]>([]);
	const [historyLoading, setHistoryLoading] = useState<boolean>(false);

	const fetchAllPendingTransactions = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0 || loadingAssets || loadingTreasury)
			return;
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allTxns = [];
		setQueueLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getQueueTransaction_substrate`, {
					body: JSON.stringify({
						limit: multisig.proxy ? 5 : 10,
						multisigAddress: multisig?.address,
						network: multisig?.network,
						page: 1
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: queueData, error: queueError } = (await createOrgRes.json()) as {
					data: IQueueItem[];
					error: string;
				};
				if (queueData && !queueError) {
					queueData.forEach((item) =>
						allTxns.push({ ...item, multisigAddress: multisig.address, network: multisig.network })
					);
				}
			})
		);
		setQueueLoading(false);
		const sorted = [...allTxns].sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1));
		setPendingTxns(sorted);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeOrg, wallets, loadingAssets, loadingTreasury]);

	useEffect(() => {
		fetchAllPendingTransactions();
	}, [fetchAllPendingTransactions]);

	const fetchAllTransactions = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0 || loadingAssets || loadingTreasury)
			return;
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allTxns = [];
		setHistoryLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getHistoryTransaction_substrate`, {
					body: JSON.stringify({
						limit: multisig.proxy ? 5 : 10,
						multisigAddress: multisig?.address,
						network: multisig?.network,
						page: 1
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: historyData, error: historyError } = (await createOrgRes.json()) as {
					data: { count: number; transactions: ITransaction[] };
					error: string;
				};
				if (historyData?.transactions && !historyError) {
					historyData?.transactions.forEach((item) =>
						allTxns.push({ ...item, multisigAddress: multisig.address, network: multisig.network })
					);
				}
			})
		);
		setHistoryLoading(false);
		const sorted = [...allTxns].sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1));
		setCompletedTransactions(sorted);
	}, [activeOrg, loadingAssets, loadingTreasury]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions]);

	return (
		<div className={`w-full h-[400px] bg-bg-main rounded-xl p-8 flex flex-col ${className}`}>
			<div className='flex items-center mb-4 scale-90 w-[111%] origin-top-left'>
				<Button
					onClick={() => setTab(ETab.HISTORY)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
						// eslint-disable-next-line sonarjs/no-duplicate-string
						tab === ETab.HISTORY && 'text-primary bg-highlight'
					}`}
				>
					History
				</Button>
				<Button
					onClick={() => setTab(ETab.QUEUE)}
					// icon={<QueueIcon />}
					size='large'
					className={`font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none flex items-center gap-x-2 ${
						tab === ETab.QUEUE && 'text-primary bg-highlight'
					}`}
				>
					Queue{' '}
					<span
						className={`bg-highlight text-primary ${
							tab === ETab.QUEUE && 'text-white bg-primary'
						} rounded-full flex items-center justify-center h-5 w-5 font-normal text-sm`}
					>
						{pendingTxns?.length || 0}
					</span>
				</Button>
				<Button
					onClick={() => setTab(ETab.MEMBERS)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
						tab === ETab.MEMBERS && 'text-primary bg-highlight'
					}`}
				>
					Members
				</Button>
			</div>
			<div className='overflow-y-auto pr-2 flex-1'>
				{tab === ETab.MEMBERS ? (
					<MembersTable />
				) : tab === ETab.HISTORY ? (
					<TransactionHistory
						completedTransactions={completedTransactions}
						loading={historyLoading}
					/>
				) : (
					<TransactionQueue
						loading={queueLoading}
						pendingTxns={pendingTxns}
					/>
				)}
			</div>
		</div>
	);
};

export default OrgInfoTable;
