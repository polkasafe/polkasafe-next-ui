// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { ITransactionFields } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { transactionFields } = (await req.json()) as { transactionFields: ITransactionFields };
	if (!transactionFields || typeof transactionFields !== 'object')
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		addressRef.update({ transactionFields });

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in updateTransactionFields :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}