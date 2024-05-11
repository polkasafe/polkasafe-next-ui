/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import dayjs from 'dayjs';
import { IQueueItem, ITransaction } from '@next-common/types';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import useFetch from '@next-substrate/hooks/useFetch';
import { useCache } from '@next-substrate/context/CachedDataContext';
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
	const [pendingTxns, setPendingTxns] = useState<IQueueItem[]>([]);
	// const [queueLoading, setQueueLoading] = useState<boolean>(false);
	const [completedTransactions, setCompletedTransactions] = useState<ITransaction[]>([]);
	// const [historyLoading, setHistoryLoading] = useState<boolean>(false);

	const multisigs = activeOrg?.multisigs?.map((item) => ({ address: item.address, network: item.network }));

	const { getCache } = useCache();

	const queueItems = getCache(`all-queue-txns-${activeOrg?.id}`);

	const {
		data: historyData,
		// error,
		loading: historyLoading,
		refetch: historyRefetch
	} = useFetch<{ count: number; transactions: ITransaction[] }>({
		body: {
			limit: 10,
			multisigs: multisigs && multisigs.length > 0 ? multisigs : null,
			page: 1
		},
		cache: {
			enabled: true,
			tte: 3600
		},
		headers: firebaseFunctionsHeader(),
		initialEnabled: false,
		key: `all-history-txns-${activeOrg?.id}`,
		url: `${FIREBASE_FUNCTIONS_URL}/getHistoryTransactionForOrg_substrate`
	});

	const {
		data: queueData,
		// error,
		loading: queueLoading,
		refetch: queueRefetch
	} = useFetch<IQueueItem[]>({
		body: {
			limit: 10,
			multisigs: multisigs && multisigs.length > 0 ? multisigs : null,
			page: 1
		},
		cache: {
			enabled: true,
			tte: 3600
		},
		headers: firebaseFunctionsHeader(),
		initialEnabled: false,
		key: `all-queue-txns-${activeOrg?.id}`,
		url: `${FIREBASE_FUNCTIONS_URL}/getQueueTransactionForOrg_substrate`
	});

	useEffect(() => {
		if (!historyData) return;

		const sorted = historyData.transactions.sort((a, b) =>
			dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1
		);
		setCompletedTransactions(sorted);
	}, [historyData]);

	useEffect(() => {
		if (!queueData) return;

		const sorted = queueData.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1));
		setPendingTxns(sorted);
	}, [queueData]);

	const fetchBoth = useCallback(
		async (hard?: boolean) => {
			if (loadingAssets) return;
			if (activeOrg && activeOrg.id) {
				await historyRefetch(hard);
				await queueRefetch(hard);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[activeOrg, activeOrg?.id, loadingAssets]
	);

	useEffect(() => {
		fetchBoth();
	}, [fetchBoth, queueItems]);

	return (
		<div className={`w-full h-[400px] bg-bg-main rounded-xl p-8 flex flex-col ${className} max-sm:overflow-x-auto`}>
			<div className='flex items-center gap-x-4 mb-4 scale-90 w-[110%] origin-top-left max-sm:w-[300px]'>
				<Button
					onClick={() => setTab(ETab.HISTORY)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none ${
						tab === ETab.HISTORY ? 'bg-highlight border-primary' : 'border border-text_placeholder hover:border-primary'
					} max-sm:text-xs max-sm:p-3`}
				>
					History
				</Button>
				<Button
					onClick={() => setTab(ETab.QUEUE)}
					// icon={<QueueIcon />}
					size='large'
					className={`flex items-center gap-x-2 rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none ${
						tab === ETab.QUEUE ? 'bg-highlight border-primary' : 'border border-text_placeholder hover:border-primary'
					} max-sm:text-xs max-sm:p-3`}
				>
					Queue{' '}
					<span
						className={`bg-highlight text-primary ${
							tab === ETab.QUEUE && 'text-white bg-primary'
						} rounded-full flex items-center justify-center h-5 w-5 font-normal text-sm`}
					>
						{queueLoading || historyLoading ? (
							<SyncOutlined spin={queueLoading || historyLoading} />
						) : (
							pendingTxns?.length || 0
						)}
					</span>
				</Button>
				<Button
					onClick={() => setTab(ETab.MEMBERS)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none ${
						tab === ETab.MEMBERS ? 'bg-highlight border-primary' : 'border border-text_placeholder hover:border-primary'
					} max-sm:text-xs max-sm:p-3`}
				>
					Members
				</Button>
				<div className='flex-1 max-sm:hidden' />
				<Button
					size='large'
					onClick={() => fetchBoth(true)}
					disabled={queueLoading || historyLoading}
					icon={
						<SyncOutlined
							spin={queueLoading || historyLoading}
							className='text-primary'
						/>
					}
					className='text-primary bg-highlight outline-none border-none font-medium text-sm max-sm:hidden'
				>
					Refresh
				</Button>
				<Button
					size='small'
					onClick={() => fetchBoth(true)}
					disabled={queueLoading || historyLoading}
					className='text-primary bg-highlight outline-none border-none font-medium text-xs hidden max-sm:block'
				>
					<SyncOutlined
						spin={queueLoading || historyLoading}
						className='text-primary'
					/>
				</Button>
			</div>
			<div className='overflow-hidden flex-1'>
				{tab === ETab.MEMBERS ? (
					<MembersTable />
				) : tab === ETab.HISTORY ? (
					<TransactionHistory
						completedTransactions={completedTransactions}
						loading={historyLoading}
					/>
				) : (
					<TransactionQueue
						loading={queueLoading || historyLoading}
						pendingTxns={pendingTxns}
					/>
				)}
			</div>
		</div>
	);
};

export default OrgInfoTable;
