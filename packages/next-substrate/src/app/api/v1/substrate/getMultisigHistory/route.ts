// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */

import { encodeAddress } from '@polkadot/util-crypto';
import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import isValidRequest from '@next-substrate/app/api/v1/substrate/api-utils/isValidRequest';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { chainProperties } from '@next-common/global/networkConstants';
import getHistoryTransactions from '../api-utils/getHistoryTransactions';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headersList = headers();
	const signature = headersList.get('x-signature');
	const address = headersList.get('x-address');
	const network = String(headersList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { multisigAddress, limit, page } = await req.json();
	if (!multisigAddress || !network || Number.isNaN(limit) || Number.isNaN(page))
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	if (Number(limit) > 100 || Number(limit) <= 0)
		return NextResponse.json({ data: null, error: responseMessages.invalid_limit }, { status: 400 });
	if (Number(page) <= 0)
		return NextResponse.json({ data: null, error: responseMessages.invalid_page }, { status: 400 });

	try {
		const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);
		const {
			data: { transactions: historyItemsArr, count },
			error: historyItemsError
		} = await getHistoryTransactions(encodedMultisigAddress, network, Number(limit), Number(page), firestoreDB);

		if (historyItemsError || !historyItemsArr)
			return NextResponse.json(
				{ data: null, error: historyItemsError || responseMessages.queue_fetch_error },
				{ status: 400 }
			);

		return NextResponse.json({ data: { count, transactions: historyItemsArr }, error: null }, { status: 200 });

		// TODO: make a copy to db after response is sent
		// single batch will do because there'll never be more than 100 transactions
		// const firestoreBatch = firestoreDB.batch();

		// transactionsArr.forEach((transaction) => {
		// const transactionRef = firestoreDB.collection('transactions').doc(transaction.callHash);
		// firestoreBatch.set(transactionRef, transaction);
		// });

		// await firestoreBatch.commit();
	} catch (err: unknown) {
		console.error('Error in getMultisigHistory :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
