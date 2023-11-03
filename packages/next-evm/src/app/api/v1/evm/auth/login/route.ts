// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */

import { v4 as uuidv4 } from 'uuid';
import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headersList = headers();
	const network = headersList.get('x-network');

	const { address } = await req.json();
	try {
		if (!address) {
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 401 });
		}
		const token = `Polkasafe Login Token: ${uuidv4()}`;
		const docId = `${address}_${network}`;
		const addressRef = firestoreDB.collection('addresses').doc(docId);
		await addressRef.set({ address, token }, { merge: true });
		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getConnectAddressToken :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
