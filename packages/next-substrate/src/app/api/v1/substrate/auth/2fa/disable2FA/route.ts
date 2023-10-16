// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import firebaseAdmin, { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import isValidRequest from '../../../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headerList = headers();
	const address = headerList.get('x-address');
	const signature = headerList.get('x-signature');
	const network = headerList.get('x-network');

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);

		await addressRef.set({ two_factor_auth: firebaseAdmin.firestore.FieldValue.delete() }, { merge: true });

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in disable2FA : ', err);
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
