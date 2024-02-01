import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { IQueuedTransactions, convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import returnTxUrl from '@next-common/global/gnosisService';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { IHistoryTransactions, convertSafeHistoryData } from '@next-evm/utils/convertSafeData/convertSafeHistory';
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

	const { allAssets } = useMultisigAssetsContext();

	const { activeOrg } = useActiveOrgContext();
	const { wallets } = useWallets();
	const [pendingTxns, setPendingTxns] = useState<IQueuedTransactions[]>([]);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);
	const [completedTransactions, setCompletedTransactions] = useState<IHistoryTransactions[]>([]);
	const [historyLoading, setHistoryLoading] = useState<boolean>(false);

	const fetchAllPendingTransactions = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0) return;
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allTxns = [];
		setQueueLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				const provider = await wallets?.[0].getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const pendingSafeData = await gnosisService.getPendingTx(multisig.address);
				console.log('pending', pendingSafeData);
				const convertedPendingData = pendingSafeData.results.map((safe: any) =>
					convertSafePendingData({ ...safe, network: multisig.network })
				);
				allTxns.push(...convertedPendingData);
			})
		);
		setQueueLoading(false);
		const sorted = [...allTxns].sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1));
		setPendingTxns(sorted);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeOrg, wallets]);

	useEffect(() => {
		fetchAllPendingTransactions();
	}, [fetchAllPendingTransactions]);

	const fetchAllTransactions = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0) return;
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allTxns = [];
		setHistoryLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				const provider = await wallets?.[0].getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const completedSafeData = await gnosisService.getAllTx(multisig.address, {
					executed: true,
					trusted: true
				});
				const convertedCompletedData = completedSafeData.results.map((safe: any) =>
					convertSafeHistoryData({ ...safe, network: multisig.network })
				);
				allTxns.push(...convertedCompletedData);
			})
		);
		setHistoryLoading(false);
		const sorted = [...allTxns].sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1));
		setCompletedTransactions(sorted);
	}, [activeOrg, wallets]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions]);

	console.log('allAssets', allAssets);
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
