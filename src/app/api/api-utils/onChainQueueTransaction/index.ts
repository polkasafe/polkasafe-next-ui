// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import axios from 'axios';
import { IDBTransaction, ITransaction } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import { ResponseMessages } from '@common/constants/responseMessage';
import { TRANSACTION_COLLECTION } from '@common/db/collections';

interface IResponse {
	error?: string | null;
	data: { transactions: ITransaction[]; count: number };
}

const getQueueTransactions = async (multisigAddress: string, network: string, page: number, entries: number) => {
	const queueTransactions = await axios.post(
		`https://api-${network}.rootscan.io/api/scan/multisigs/details`,
		{
			account: multisigAddress,
			page: page - 1 || 0, // pages start from 0
			row: entries || 1,
			status: 'Approval'
		},
		{ headers: SUBSCAN_API_HEADERS }
	);

	const { data: queueData } = queueTransactions.data;

	const filteredQueueData =
		queueData && queueData.multisig?.length
			? queueData.multisig.filter((transaction: any) => transaction.status === 'Approval')
			: [];

	const queuePromise = filteredQueueData.map(async (transaction: any) => {
		const dbTransactionDoc = await TRANSACTION_COLLECTION.doc(transaction.call_hash).get();
		const dbTransaction: IDBTransaction = dbTransactionDoc.data() as IDBTransaction;

		return {
			multi_id: transaction?.multi_id || '',
			multisigAddress,
			approvals: transaction?.approve_record?.map((item: any) => item?.account_display?.address),
			initiator:
				transaction?.approve_record?.find((item: any) => item?.approve_type === 'Initialize')?.account_display
					?.address || '',
			callData: transaction?.call_data
				? transaction?.call_data
				: dbTransactionDoc.exists && dbTransaction?.callData
					? dbTransaction?.callData
					: '',
			callHash: transaction.call_hash,
			created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
			network,
			note: dbTransactionDoc.exists && dbTransaction?.note ? transaction?.note : '',
			status: transaction.status,
			threshold: transaction.threshold,
			callModule: transaction.call_module,
			callModuleFunction: transaction.call_module_function,
			totalAmount: dbTransactionDoc.exists && dbTransaction?.amount_token ? transaction?.amount_token : '',
			transactionFields:
				dbTransactionDoc.exists && dbTransaction?.transactionFields
					? transaction?.transactionFields
					: { category: 'none', subfields: {} }
		} as unknown as IDBTransaction;
	});

	return Promise.all(queuePromise);
};

export async function onChainQueueTransaction(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number
): Promise<IResponse> {
	const returnValue: IResponse = {
		data: { count: 0, transactions: [] },
		error: ''
	};

	try {
		const queueItems = await getQueueTransactions(multisigAddress, network, page, entries);

		returnValue.data.transactions = queueItems;
		returnValue.data.count = queueItems.length;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || ResponseMessages.TRANSFERS_FETCH_ERROR;
	}

	return returnValue;
}
