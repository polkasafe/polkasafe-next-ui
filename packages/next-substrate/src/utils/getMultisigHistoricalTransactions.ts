// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { ITransaction } from '@next-common/types';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { responseMessages } from '@next-common/constants/response_messages';

interface IResponse {
	error?: string | null;
	data: { transactions: ITransaction[]; count: number };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function getMultisigHistoricalTransactions(
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
		const transactions: ITransaction[] = [];

		const otherTransactionsRes = await fetch(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			body: JSON.stringify({
				account: multisigAddress,
				page: page - 1 || 0, // pages start from 0
				row: entries || 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data: otherTransactions } = await otherTransactionsRes.json();

		if (otherTransactions && otherTransactions.multisig?.length) {
			// eslint-disable-next-line no-restricted-syntax
			for (const transaction of otherTransactions.multisig) {
				// eslint-disable-next-line no-continue
				if (transaction.status !== 'Executed') continue;
				// const fetchPriceRes = await fetch(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transaction.block_timestamp * 1000).format('YYYY-MM-DD')}`, {
				// method: 'GET'
				// });
				// const responseJSON = await fetchPriceRes.json();
				// const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';

				// eslint-disable-next-line no-await-in-loop
				const multisigDataRes = await fetch(`https://${network}.api.subscan.io/api/scan/multisig`, {
					body: JSON.stringify({
						call_hash: transaction.call_hash,
						multi_id: transaction.multi_id
					}),
					headers: SUBSCAN_API_HEADERS,
					method: 'POST'
				});

				// eslint-disable-next-line no-await-in-loop
				const { data: multisigData } = await multisigDataRes.json();

				const newTransaction: ITransaction = {
					amount_token: '',
					amount_usd: Number(transaction.usd_amount) * Number(1),
					approvals: multisigData?.process
						?.filter((item: any) => item.status === 'Approval' || item.status === 'Executed')
						.map((item: any) => item.account_display.address),
					block_number: Number(transaction.block_num || 0),
					callData: multisigData?.call_data || '',
					callHash: transaction.call_hash,
					created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
					from: transaction.multi_account_display.address,
					network,
					note: '',
					to: transaction.to,
					token: transaction.asset_symbol,
					transactionFields: {} as any
				};
				transactions.push(newTransaction);
			}
		}

		const res = await fetch(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
			body: JSON.stringify({
				address: multisigAddress,
				currency: 'token',
				page: page - 1 || 0, // pages start from 0
				row: entries || 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data: response } = await res.json();

		if (response && response.transfers?.length) {
			// eslint-disable-next-line no-restricted-syntax
			for (const transfer of response.transfers) {
				if (transfer.to === multisigAddress) {
					const newTransaction: ITransaction = {
						amount_token: transfer.amount,
						amount_usd: Number(transfer.usd_amount) * Number(1),
						approvals: [],
						block_number: Number(transfer.block_num),
						callHash: transfer.hash,
						created_at: dayjs(transfer.block_timestamp * 1000).toDate(),
						from: transfer.from,
						network,
						to: transfer.to,
						token: transfer.asset_symbol
					};

					transactions.push(newTransaction);
				}
			}
		}

		returnValue.data.transactions = transactions;
		returnValue.data.count = transactions.length;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}
