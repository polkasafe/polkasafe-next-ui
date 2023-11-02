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
import { IFeedback } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
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

	const { review, rating } = await req.json();
	if (Number.isNaN(rating) || Number(rating) <= 0 || Number(rating) > 5)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		const feedbackRef = firestoreDB.collection('feedbacks').doc();
		const newFeedback: IFeedback = {
			address,
			rating: Number(rating),
			review: String(review) || ''
		};

		await feedbackRef.set(newFeedback);

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in addFeedback :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}