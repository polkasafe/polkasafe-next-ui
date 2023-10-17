// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { ITransaction } from '@next-common/types';

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import formatBnBalance from './formatBnBalance';
import nextApiClientFetch from './nextApiClientFetch';

type Args = Omit<ITransaction, 'created_at' | 'amount_usd' | 'amount_token' | 'id' | 'token'> & {
	amount: BN;
	approvals?: string[];
	transactionFields?: { category: string; subfields: { [subfield: string]: { name: string; value: string } } };
};

export default async function addNewTransaction({
	amount,
	approvals,
	transactionFields,
	network,
	block_number,
	callData,
	callHash,
	from,
	to,
	note
}: Args): Promise<{ data?: ITransaction; error: string } | any> {
	const newTransactionData: Omit<Args, 'amount'> & { amount_token: number } = {
		amount_token: Number(
			formatBnBalance(amount, { numberAfterComma: 4, withThousandDelimitor: false, withUnit: false }, network)
		),
		approvals,
		block_number,
		callData,
		callHash,
		from,
		network,
		note,
		to,
		transactionFields
	};

	return nextApiClientFetch<ITransaction>(`${SUBSTRATE_API_URL}/addTransaction`, newTransactionData);
}
