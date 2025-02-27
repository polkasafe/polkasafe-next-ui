// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useCallback, useEffect, useState } from 'react';
import { useHistoryAtom, useQueueAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { useTransactions } from '@substrate/app/global/hooks/queryHooks/useTransactions';
import { ENetwork, ETransactionType } from '@common/enum/substrate';
import { useSearchParams } from 'next/navigation';
import { useQueueTransaction } from '@substrate/app/global/hooks/queryHooks/useQueueTransaction';

function InitializeTransaction() {
	const [organisation] = useOrganisation();
	const [queueTransaction, setQueueTransaction] = useQueueAtom();
	const [historyTransaction, setHistoryTransaction] = useHistoryAtom();
	const address = useSearchParams().get('_multisig');
	const network = useSearchParams().get('_network') as ENetwork;
	const singleMultisigId = `${address}_${network}`;

	const multisigs = organisation?.multisigs || [];
	console.log('multisigs', multisigs);
	const multisigIds = multisigs.map((multisig) => `${multisig.address}_${multisig.network}`);

	console.log('multisigIds', multisigIds);

	multisigs.forEach((multisig) => {
		if (multisig.network === ENetwork.POLKADOT || multisig.network === ENetwork.POLKADOT_ASSETHUB) {
			multisigIds.push(`${multisig.address}_${ENetwork.PEOPLE}`);
		}
	});

	const isAddedMultisig = multisigIds.includes(singleMultisigId);
	const singleIdWithPeople = [singleMultisigId];

	if (isAddedMultisig && (network === ENetwork.POLKADOT_ASSETHUB || network === ENetwork.POLKADOT)) {
		singleIdWithPeople.push(`${address}_${ENetwork.PEOPLE}`);
	}

	// get All the data for the all multisig on multisig
	const allMultisigIds = isAddedMultisig ? singleIdWithPeople : multisigIds;

	console.log('allMultisigIds', allMultisigIds);

	const [queueCurrentIndex, setQueueCurrentIndex] = useState<number>(0);
	const [historyCurrentIndex, setHistoryCurrentIndex] = useState<number>(0);

	const { data: historyData, isSuccess: historySuccess } = useTransactions({
		multisigId: allMultisigIds[historyCurrentIndex],
		type: ETransactionType.HISTORY_TRANSACTION
	});

	const { data: queueData, isSuccess: queueSuccess } = useQueueTransaction({
		multisigId: allMultisigIds[queueCurrentIndex]
	});
	console.log('queueData', queueData);

	const getHistoryData = useCallback(() => {
		if (historySuccess && historyData) {
			// Use a Set to filter for unique callHash
			const payload = historyTransaction ? [...(historyTransaction?.transactions || []), ...historyData] : historyData;
			const uniqueTransactions = Array.from(new Map(payload.map((tx) => [tx.callHash, tx])).values());

			const transactions = uniqueTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
			setHistoryTransaction({ transactions: transactions, currentIndex: historyCurrentIndex });
			// Move to the next ID if there are more left
			if (historyCurrentIndex < allMultisigIds.length - 1) {
				setHistoryCurrentIndex((prev) => prev + 1);
			}
		}
	}, [historyData, historySuccess, historyCurrentIndex]);

	const getQueueData = useCallback(() => {
		if (queueSuccess && queueData) {
			// Use a Set to filter for unique callHash
			const payload = queueTransaction ? [...(queueTransaction?.transactions || []), ...queueData] : queueData;
			const uniqueTransactions = Array.from(new Map(payload.map((tx) => [tx.callHash, tx])).values());

			const transactions = uniqueTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

			setQueueTransaction({ transactions: transactions, currentIndex: queueCurrentIndex });
			console.log('transactions::', transactions);
			// Move to the next ID if there are more left
			if (queueCurrentIndex < allMultisigIds.length - 1) {
				setQueueCurrentIndex((prev) => prev + 1);
			}
		}
	}, [queueData, queueSuccess, queueCurrentIndex]);

	useEffect(() => {
		if (!Boolean(multisigs.length)) {
			return;
		}
		getHistoryData();
	}, [getHistoryData]);

	useEffect(() => {
		if (!Boolean(multisigs.length)) {
			return;
		}
		getQueueData();
	}, [getQueueData]);

	// Reset transaction states when URL parameters change
	useEffect(() => {
		if (!organisation || !queueTransaction || !historyTransaction) {
			return;
		}
		setQueueCurrentIndex(0);
		setHistoryCurrentIndex(0);
		setQueueTransaction(null);
		setHistoryTransaction(null);
	}, [organisation]);

	return null;
}

export default InitializeTransaction;
