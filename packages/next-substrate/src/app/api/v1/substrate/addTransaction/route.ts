// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { responseMessages } from '@next-common/constants/response_messages';
import { NextResponse } from 'next/server';
import { chainProperties } from '@next-common/global/networkConstants';
import { ITransaction } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';
import fetchTokenUSDValue from '../api-utils/fetchTokenUSDValue';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { amount_token, approvals, block_number, callData, callHash, from, to, note, transactionFields } =
		await req.json();
	if (!block_number || !callHash || !from || !network)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		const usdValue = await fetchTokenUSDValue(network);
		const newTransaction: ITransaction = {
			amount_token: String(amount_token) || '',
			amount_usd: usdValue ? Number(amount_token) * usdValue : 0,
			approvals: approvals || [],
			block_number: Number(block_number),
			callData,
			callHash,
			created_at: new Date(),
			from,
			network,
			note: note || '',
			to: to || '',
			token: chainProperties[network].tokenSymbol,
			transactionFields: transactionFields || {}
		};

		const transactionRef = firestoreDB.collection('transactions').doc(String(callHash));
		await transactionRef.set(newTransaction);

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in addTransaction :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
