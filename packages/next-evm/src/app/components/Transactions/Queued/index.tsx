// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import Loader from '@next-common/ui-components/Loader';
import { IQueuedTransactions, convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import updateDB, { UpdateDB } from '@next-evm/utils/updateDB';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

interface IQueued {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: boolean;
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Queued: FC<IQueued> = ({ loading, setLoading, refetch, setRefetch }) => {
	const { address, activeMultisig, setActiveMultisigData, activeMultisigData, gnosisSafe } =
		useGlobalUserDetailsContext();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueuedTransactions[]>([]);
	const { network } = useGlobalApiContext();

	const handleAfterApprove = (callHash: string) => {
		const payload = queuedTransactions.map((queue) => {
			return queue.txHash === callHash ? { ...queue, signatures: [...(queue.signatures || []), { address }] } : queue;
		});
		setQueuedTransactions(payload as any);
	};

	const handleAfterExecute = (callHash: string) => {
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
					...activeMultisigData,
					signatories: [...activeMultisigData.signatories, addedAddress.value],
					threshold: newThreshold.value
				};
				setActiveMultisigData(payloads);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, network);
			} else if (transaction.type === 'removeOwner') {
				const [, removedAddress, newThreshold] = transaction.dataDecoded.parameters;
				const payloads = {
					...activeMultisigData,
					signatories: activeMultisigData.signatories.filter((a: string) => a !== removedAddress.value),
					threshold: newThreshold.value
				};
				setActiveMultisigData(payloads);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, network);
			}
		}
		setQueuedTransactions(payload);
	};

	// useEffect(() => {
	// const hash = location.hash.slice(1);
	// const elem = document.getElementById(hash);
	// if (elem) {
	// elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
	// }
	// }, [location.hash, queuedTransactions]);

	useEffect(() => {
		if (!gnosisSafe) {
			console.log('retiring');
			return;
		}
		(async () => {
			setLoading(true);
			try {
				const safeData = await gnosisSafe.getPendingTx(activeMultisig);
				const convertedData = safeData.results.map((safe: any) => convertSafePendingData({ ...safe, network }));
				setQueuedTransactions(convertedData);
				if (convertedData?.length > 0)
					updateDB(UpdateDB.Update_Pending_Transaction, { transactions: convertedData }, address, network);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, address, network, refetch, gnosisSafe]);

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
								value={transaction.amount_token}
								date={transaction.created_at}
								approvals={transaction.signatures ? transaction.signatures.map((item: any) => item.address) : []}
								threshold={activeMultisigData?.threshold || 0}
								callData={transaction.data}
								callHash={transaction.txHash}
								onAfterApprove={handleAfterApprove}
								onAfterExecute={handleAfterExecute}
								txType={transaction.type}
								recipientAddress={transaction.to}
								advancedDetails={transaction.advancedDetails}
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
