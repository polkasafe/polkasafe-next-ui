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

const getExcHistoryResponse = async (multisigAddress: string, network: string, page: number, entries: number) => {
	const excHistoryResponse = await axios.post(
		`https://${network}.api.subscan.io/api/scan/multisigs/details`,
		{
			account: multisigAddress,
			page: page - 1 || 0, // pages start from 0
			row: entries || 1,
			status: 'Executed'
		},
		{ headers: SUBSCAN_API_HEADERS }
	);

	const { data: excHistoryData } = excHistoryResponse.data;

	const filteredExcHistoryData =
		excHistoryData && excHistoryData.multisig?.length
			? excHistoryData.multisig.filter((transaction: any) => transaction.status === 'Executed')
			: [];

	const excHistoryTransactionsPromise = filteredExcHistoryData.map(async (transaction: any) => {
		const dbTransactionDoc = await TRANSACTION_COLLECTION.doc(transaction.call_hash).get();
		const dbTransaction: IDBTransaction = dbTransactionDoc.data() as IDBTransaction;

		return {
			multi_id: transaction.multi_id || '',
			multisigAddress,
			approvals: transaction?.approve_record?.map((item: any) => item?.account_display?.address),
			amount_token: dbTransactionDoc.exists && dbTransaction?.amount_token ? dbTransaction?.amount_token : '',
			amount_usd: String(Number(transaction.usd_amount) * Number(1)),
			block_number: Number(transaction.block_num || 0),
			callData: transaction?.call_data
				? transaction?.call_data
				: dbTransactionDoc.exists && transaction?.callData
					? transaction?.callData
					: '',
			callHash: transaction.call_hash,
			created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
			from: transaction.multi_account_display.address,
			initiator: transaction.account_display.address,
			network,
			note: dbTransaction?.note || '',
			to: transaction.to,
			token: transaction.asset_symbol,
			transactionFields: dbTransaction?.transactionFields || ({} as any)
		} as unknown as IDBTransaction;
	});
	return Promise.all(excHistoryTransactionsPromise);
};

const getAllHistoryResponse = async (multisigAddress: string, network: string, page: number, entries: number) => {
	const allHistoryResponse = await axios.post(
		`https://${network}.api.subscan.io/api/v2/scan/transfers`,
		{
			address: multisigAddress,
			currency: 'token',
			page: page - 1 || 0, // pages start from 0
			row: entries
		},
		{ headers: SUBSCAN_API_HEADERS }
	);

	const { data: allHistoryData } = allHistoryResponse.data;
	const filteredAllHistoryData =
		allHistoryData && allHistoryData.transfers?.length
			? allHistoryData.transfers.filter((transfer: any) => transfer.to === multisigAddress)
			: [];

	const allHistoryTransactionsPromise = filteredAllHistoryData.map(async (transaction: any) => {
		const dbTransactionDoc = await TRANSACTION_COLLECTION.doc(transaction.hash).get();
		const dbTransaction: ITransaction = dbTransactionDoc.data() as ITransaction;

		return {
			multisigAddress,
			amount_token: transaction.amount,
			amount_usd: String(Number(transaction.usd_amount) * Number(1)),
			approvals: dbTransactionDoc.exists && dbTransaction.approvals ? dbTransaction.approvals : [],
			block_number: Number(transaction.block_num),
			callHash: transaction.hash,
			created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
			from: transaction.from,
			network,
			to: transaction.to,
			token: transaction.asset_symbol,
			transactionFields: dbTransaction?.transactionFields || ({} as any),
			initiator: transaction?.account_display?.address,
			callData: transaction?.call_data
				? transaction?.call_data
				: dbTransactionDoc.exists && dbTransaction?.callData
					? dbTransaction?.callData
					: ''
		} as unknown as IDBTransaction;
	});
	return Promise.all(allHistoryTransactionsPromise);
};

export async function onChainHistoryTransaction(
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
		const excHistoryTransactionsPromise = getExcHistoryResponse(multisigAddress, network, page, entries);
		const allHistoryTransactionsPromise = getAllHistoryResponse(multisigAddress, network, page, entries);

		const [excHistoryTransactions, allHistoryTransactions] = await Promise.all([
			excHistoryTransactionsPromise,
			allHistoryTransactionsPromise
		]);
		const allTransactions = [...excHistoryTransactions, ...allHistoryTransactions];
		const callhashCounts = allTransactions.reduce((acc, obj) => {
			acc[obj.callhash] = (acc[obj.callhash] || 0) + 1;
			return acc;
		}, {});

		const processedCallhashes = new Set();

		// Step 3: Filter the array to include:
		const filteredArray = allTransactions.filter((obj) => {
			const isUnique = callhashCounts[obj.callhash] === 1;
			const isFirstRepeated = !processedCallhashes.has(obj.callhash) && callhashCounts[obj.callhash] > 1;

			if (isUnique || isFirstRepeated) {
				processedCallhashes.add(obj.callhash);
				return true;
			}
			return false;
		});

		returnValue.data.transactions = filteredArray;

		// const excHistoryTransactions = await getExcHistoryResponse(multisigAddress, network, page, entries);
		// returnValue.data.transactions = excHistoryTransactions;
		// const allHistoryTransactionsPromise = await getAllHistoryResponse(multisigAddress, network, page, entries);
		// returnValue.data.transactions = allHistoryTransactionsPromise;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', (err as any).message);
		returnValue.error = String(err) || ResponseMessages.TRANSFERS_FETCH_ERROR;
	}

	return returnValue;
}
