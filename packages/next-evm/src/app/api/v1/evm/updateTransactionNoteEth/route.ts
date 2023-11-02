// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import verifyEthSignature from '@next-common/utils/verifyEthSignature';
import { IMultisigAddress, ITransaction } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headersList = headers();
	const address = headersList.get('x-address');
	const signature = headersList.get('x-signature');
	const network = headersList.get('x-network');

	if (!signature || !address) {
		return NextResponse.json({ data: null, error: responseMessages.missing_headers }, { status: 400 });
	}
	const docId = `${address}_${network}`;
	const addressRef = firestoreDB.collection('addresses').doc(docId);
	const doc = await addressRef.get();
	let token = '';

	if (doc.exists) {
		const data = doc.data();
		token = data?.token;
	}
	const isValid = await verifyEthSignature(address, signature, token);
	if (!isValid) return NextResponse.json({ data: null, error: responseMessages.invalid_signature }, { status: 400 });

	const { callHash, multisigAddress, note } = await req.json();
	if (!callHash || !note)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const txRef = firestoreDB.collection('transactions').doc(callHash);
		const txDoc = await txRef.get();
		const txDocData = txDoc.data() as ITransaction;

		if (txDoc.exists && txDocData.from === address) {
			txRef.update({ note: String(note) });
			return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
		}

		if (!multisigAddress && !txDoc.exists)
			return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

		// get signatories for multisig
		const multisigAddressDoc = await firestoreDB
			.collection('multisigAddresses')
			.doc(txDoc.exists && txDocData.from ? txDocData.from : multisigAddress)
			.get();

		if (
			multisigAddressDoc.exists &&
			(multisigAddressDoc.data() as IMultisigAddress).signatories.includes(address || '')
		) {
			txRef.set({ callHash, note: String(note) }, { merge: true });
			return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
		}

		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in updateTransactionNote :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
