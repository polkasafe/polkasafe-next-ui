// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import axios from 'axios';
import { IDBTransaction, ITransaction } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import { ResponseMessages } from '@common/constants/responseMessage';
import { TRANSACTION_COLLECTION } from '@common/db/collections';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import { ENetwork } from '@common/enum/substrate';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

interface IResponse {
	error?: string | null;
	data: { transactions: ITransaction[]; count: number };
}

const getAllHistoryResponse = async (multisigAddress: string, network: string, page: number, entries: number) => {
	const allHistoryResponse = await axios.post(
		`https://api-${network}.rootscan.io/v1/native-transfers`,
		{
			address: multisigAddress,
			page: page - 1 || 0, // pages start from 0
			perPage: entries
		},
		{ headers: SUBSCAN_API_HEADERS }
	);

	const { data: allHistoryData } = allHistoryResponse.data;

	// Transaction Type
	/// {
	//   eventId: '18817849-4',
	//   args: {
	//     from: '0xC289Ac9F7A28b4eebaA24C145e8E9213f90c1d20',
	//     to: '0x653d80f2e7819F78eb5daC75720Ce9e1DDF045B0',
	//     amount: 10000000
	//   },
	//   blockNumber: 18817849,
	//   doc: 'Transfer succeeded.',
	//   extrinsicId: '18817849-1',
	//   hash: '0x416610de24db147694a371a5aa1c7b5d1bee9298dcc2d403d82f897e955a2d20',
	//   method: 'Transfer',
	//   section: 'balances',
	//   timestamp: 1739926040,
	//   _nftOwnersProcessed: true,
	//   block: {
	//     number: 18817849,
	//     eventsCount: 7,
	//     evmBlock: {
	//       hash: '0x5b230a8cb65cfe328720f449bcca4a1dfe402c24b27a8424f42f81a984817490',
	//       parentHash: '0x1cf1000d599ed0225d2b474212d2c7b66b51593703b1dcfcf69b01c518d0d5f4',
	//       stateRoot: '0x269dd02116b72c05d80dd25d7a664dae9e3dca2d8d55f8a46418c15f3a5ef783',
	//       miner: '0x5630a480727CD7799073b36472d9b1A6031F840b'
	//     },
	//     extrinsicsCount: 1,
	//     extrinsicsRoot: '0xb02e80526ca8acb05c0570e77a99067d845ce01ec2d7aba48c667d8fcdd9a112',
	//     hash: '0xe9500e4b7c32fb0ede204e1d200e8e63a4025487bf0c578420f4fc7d0c546b0d',
	//     isFinalized: true,
	//     parentHash: '0x482cdf927d28fde5dfe364b7b6c80ea3cca98b1f493a9e87d30851d219ef7a52',
	//     spec: 'root/66',
	//     stateRoot: '0xde03d6376b0a5f7a60e6a5a723c14bee0bf089520e2a8dc0420acd732b8fe3da',
	//     timestamp: 1739926040000,
	//     transactionsCount: 0
	//   }
	// extrinsic: {
	//     extrinsicId: '18817849-1',
	//     args: {
	//       dest: '0x653d80f2e7819F78eb5daC75720Ce9e1DDF045B0',
	//       value: 10000000
	//     },
	//     block: 18817849,
	//     fee: {
	//       who: '0xC289Ac9F7A28b4eebaA24C145e8E9213f90c1d20',
	//       actualFee: 11668,
	//       actualFeeFormatted: 0.011668,
	//       tip: 0,
	//       tipFormatted: 0.011668
	//     },
	//     hash: '0x4ffb9b893c7f8cbc25e67dbd25b8fb0879727dd8e74317cf6f3f80fb07b369ef',
	//     isProxy: false,
	//     isSigned: true,
	//     isSuccess: true,
	//     method: 'transferKeepAlive',
	//     proxiedMethods: [],
	//     proxiedSections: [],
	//     retroExtrinsicId: '0018817849-000001-e9500',
	//     section: 'balances',
	//     signature: '0xc067a021bafe7a4f17a10c140e15ba3dfb193ee58555a7937de4a8f4f583b03d208f116f57e544670cd3ad01e81a5779fc1c5a42d8826bfa7311a2997bed394a00',
	//     signer: '0xC289Ac9F7A28b4eebaA24C145e8E9213f90c1d20',
	//     timestamp: 1739926040
	//   }

	const allHistoryTransactionsPromise = allHistoryData.map(async (transaction: any) => {
		console.log('transaction', JSON.stringify(transaction));
		const { args, blockNumber, hash, method, section, timestamp, extrinsic } = transaction;
		const { from, to, amount } = args;
		const { signer, args: extrinsicArgs } = extrinsic;
		const amountToken = formatBalance(
			amount,
			{
				numberAfterComma: networkConstants[network as ENetwork].tokenDecimals,
				withUnit: true,
				withThousandDelimitor: true
			},
			network as ENetwork
		);

		const dbTransactionDoc = await TRANSACTION_COLLECTION.doc(hash).get();
		const dbTransaction: ITransaction = dbTransactionDoc.data() as ITransaction;

		return {
			multisigAddress,
			amount_token: amountToken,
			amount_usd: String(Number(transaction.usd_amount) * Number(1)),
			approvals: dbTransactionDoc.exists && dbTransaction.approvals ? dbTransaction.approvals : [],
			block_number: Number(transaction.block_num),
			callHash: transaction.hash,
			created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
			from,
			network,
			to,
			token: extrinsicArgs.transaction ? 'XRP' : networkConstants[network as ENetwork].tokenSymbol,
			transactionFields: dbTransaction?.transactionFields || ({} as any),
			initiator: extrinsic.signer,
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
		const allTransactions = await getAllHistoryResponse(multisigAddress, network, page, entries);
		returnValue.data.transactions = allTransactions;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || ResponseMessages.TRANSFERS_FETCH_ERROR;
	}

	return returnValue;
}
