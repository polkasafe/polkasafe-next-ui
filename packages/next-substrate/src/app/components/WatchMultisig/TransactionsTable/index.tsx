/* eslint-disable sonarjs/no-duplicate-string */
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SyncOutlined } from '@ant-design/icons';
import getMultisigHistoricalTransactions from '@next-substrate/utils/getMultisigHistoricalTransactions';
import getMultisigQueueTransactions from '@next-substrate/utils/getMultisigQueueTransactions';
import Loader from '@next-common/ui-components/Loader';
import { IAsset, IQueueItem, ITransaction } from '@next-common/types';
import Assets from './Assets';
import History from './History';
import Queue from './Queue';

enum ETab {
	QUEUE,
	HISTORY,
	ASSETS
}

const TransactionsTable = ({
	multisigAddress,
	network,
	assets
}: {
	multisigAddress: string;
	network: string;
	assets: IAsset[];
}) => {
	const [tab, setTab] = useState(ETab.HISTORY);

	const [queueLoading, setQueueLoading] = useState<boolean>(false);
	const [historyLoading, setHistoryLoading] = useState<boolean>(false);

	const [completedTransactions, setCompletedTransactions] = useState<ITransaction[]>([]);
	const [pendingTransactions, setPendingTransactions] = useState<IQueueItem[]>([]);

	const fetchHistory = useCallback(async () => {
		if (!multisigAddress || !network) return;

		setHistoryLoading(true);

		const {
			data: { transactions: multisigTransactions },
			error: multisigError
		} = await getMultisigHistoricalTransactions(multisigAddress, network, 10, 1);

		if (multisigTransactions && !multisigError) {
			setCompletedTransactions(multisigTransactions);
		}
		setHistoryLoading(false);
	}, [multisigAddress, network]);

	const fetchQueue = useCallback(async () => {
		if (!multisigAddress || !network) return;

		setQueueLoading(true);
		const { data: queueTransactions, error: queueTransactionsError } = await getMultisigQueueTransactions(
			multisigAddress,
			network,
			10,
			1
		);

		if (queueTransactions && !queueTransactionsError) {
			setPendingTransactions(queueTransactions);
		}

		setQueueLoading(false);
	}, [multisigAddress, network]);

	const fetchBoth = useCallback(async () => {
		await fetchHistory();
		await fetchQueue();
	}, [fetchHistory, fetchQueue]);

	useEffect(() => {
		fetchBoth();
	}, [fetchBoth]);

	return (
		<div className='w-full h-[400px] bg-bg-main rounded-xl p-8 flex flex-col max-sm:overflow-x-auto'>
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
						{queueLoading || historyLoading ? <SyncOutlined spin={queueLoading || historyLoading} /> : 0}
					</span>
				</Button>
				<Button
					onClick={() => setTab(ETab.ASSETS)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none ${
						tab === ETab.ASSETS ? 'bg-highlight border-primary' : 'border border-text_placeholder hover:border-primary'
					} max-sm:text-xs max-sm:p-3`}
				>
					Assets
				</Button>
				<div className='flex-1 max-sm:hidden' />
				<Button
					size='large'
					onClick={() => fetchBoth()}
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
					onClick={() => fetchBoth()}
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
				{queueLoading || historyLoading ? (
					<Loader />
				) : tab === ETab.ASSETS ? (
					<Assets assets={assets} />
				) : tab === ETab.HISTORY ? (
					<History
						completedTransactions={completedTransactions}
						multisigAddress={multisigAddress}
						network={network}
					/>
				) : (
					<Queue
						pendingTransactions={pendingTransactions}
						multisigAddress={multisigAddress}
						network={network}
					/>
				)}
			</div>
		</div>
	);
};

export default TransactionsTable;
