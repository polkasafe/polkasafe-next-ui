// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import Loader from '@next-common/ui-components/Loader';
import { IQueuedTransactions, convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import updateDB, { UpdateDB } from '@next-evm/utils/updateDB';

import { ethers } from 'ethers';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import returnTxUrl from '@next-common/global/gnosisService';
import { useWallets } from '@privy-io/react-auth';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { IMultisigAddress } from '@next-common/types';
import Transaction from './Transaction';
import NoTransactionsQueued from './NoTransactionsQueued';

interface IQueued {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: boolean;
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

const Queued: FC<IQueued> = ({ loading, setLoading, refetch, setRefetch }) => {
	const { address, activeMultisig, setActiveMultisigData, activeMultisigData } = useGlobalUserDetailsContext();

	const { activeOrg } = useActiveOrgContext();

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [queuedTransactions, setQueuedTransactions] = useState<IQueuedTransactions[]>([]);

	const [canCancelTx, setCanCancelTx] = useState<boolean>(true);

	const handleAfterApprove = (callHash: string) => {
		const payload = queuedTransactions.map((queue) => {
			return queue.txHash === callHash ? { ...queue, signatures: [...(queue.signatures || []), { address }] } : queue;
		});
		setQueuedTransactions(payload as any);
	};

	const handleAfterExecute = (callHash: string, multisig: IMultisigAddress) => {
		let transaction: any = null;
		const payload = queuedTransactions.filter((queue) => {
			if (queue.txHash === callHash) {
				transaction = queue;
			}
			return queue.txHash !== callHash;
		});
		if (transaction) {
			if (transaction.type === 'addOwnerWithThreshold') {
				const [addedAddress, newThreshold] = transaction.dataDecoded.parameters;
				const payloads = {
					...multisig,
					signatories: [...multisig.signatories, addedAddress.value],
					threshold: newThreshold.value
				};
				setActiveMultisigData(payloads);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, multisig.network);
			} else if (transaction.type === 'removeOwner') {
				const [, removedAddress, newThreshold] = transaction.dataDecoded.parameters;
				const payloads = {
					...multisig,
					signatories: multisig.signatories.filter((a: string) => a !== removedAddress.value),
					threshold: newThreshold.value
				};
				setActiveMultisigData(payloads);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, multisig.network);
			}
		}
		setQueuedTransactions(payload);
	};

	useEffect(() => {
		const hash = typeof window !== 'undefined' && window.location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, []);

	const fetchAllTransactions = useCallback(async () => {
		if (activeMultisig || !connectedWallet || !activeOrg?.multisigs || activeOrg.multisigs?.length === 0) return;
		const allTxns = [];
		setLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				const provider = await connectedWallet?.getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const completedSafeData = await gnosisService.getPendingTx(multisig.address);
				console.log('queue', completedSafeData);
				const convertedCompletedData = completedSafeData.results.map((safe: any) =>
					convertSafePendingData({ ...safe, network: multisig.network })
				);
				allTxns.push(...convertedCompletedData);
			})
		);
		setLoading(false);
		const sorted = [...allTxns].sort((a, b) => {
			const date1 = new Date(a?.created_at);
			const date2 = new Date(b?.created_at);
			return Number(date1) - Number(date2);
		});
		setQueuedTransactions(sorted.reverse());
		console.log('all txns', sorted.reverse());
	}, [activeMultisig, activeOrg?.multisigs, connectedWallet, setLoading]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions, refetch]);

	useEffect(() => {
		if (!activeMultisig || !activeMultisigData) {
			console.log('retiring');
			return;
		}
		(async () => {
			setLoading(true);
			try {
				const txUrl = returnTxUrl(activeMultisigData.network as NETWORK);
				const provider = await connectedWallet?.getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const safeData = await gnosisService.getPendingTx(activeMultisig);
				const convertedData = safeData.results.map((safe: any) =>
					convertSafePendingData({ ...safe, network: activeMultisigData?.network })
				);
				setQueuedTransactions(convertedData);
				if (convertedData?.length > 0)
					updateDB(
						UpdateDB.Update_Pending_Transaction,
						{ transactions: convertedData },
						address,
						activeMultisigData?.network
					);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		})();
	}, [activeMultisig, activeMultisigData, address, connectedWallet, refetch, setLoading]);

	if (loading) {
		return (
			<div className='h-full'>
				<Loader size='large' />
			</div>
		);
	}

	return queuedTransactions && queuedTransactions.length > 0 ? (
		<div className='flex flex-col gap-y-[10px]'>
			{queuedTransactions
				.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))
				.map((transaction) => {
					return (
						<section
							id={transaction.txHash}
							key={transaction.txHash}
						>
							<Transaction
								multisigAddress={transaction.safeAddress}
								value={transaction.amount_token}
								threshold={transaction.threshold || 0}
								date={transaction.created_at}
								approvals={transaction.signatures ? transaction.signatures.map((item: any) => item.address) : []}
								callData={transaction.data}
								callHash={transaction.txHash}
								onAfterApprove={handleAfterApprove}
								onAfterExecute={handleAfterExecute}
								txType={transaction.type}
								recipientAddress={transaction.to}
								advancedDetails={transaction.advancedDetails}
								refetchTxns={() => setRefetch((prev) => !prev)}
								canCancelTx={canCancelTx}
								setCanCancelTx={setCanCancelTx}
							/>
						</section>
					);
				})}
		</div>
	) : (
		<NoTransactionsQueued />
	);
};

export default Queued;
