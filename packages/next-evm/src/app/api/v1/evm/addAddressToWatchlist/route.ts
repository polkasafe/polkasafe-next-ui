// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { headers } from 'next/headers';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { IUser } from '@next-common/types';
import verifyEthSignature from '@next-common/utils/verifyEthSignature';

// eslint-disable-next-line import/prefer-default-export
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

	try {
		const { name, address: addressToAdd, network: networkToAdd } = await req.json();
		if (!name || !addressToAdd || !networkToAdd)
			return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
		const substrateAddressToAdd = String(addressToAdd);
		if (!substrateAddressToAdd)
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const watchlists = { ...addressDoc.watchlists } || {};

			watchlists[`${substrateAddressToAdd}_${networkToAdd}`] = {
				name,
				address: addressToAdd,
				network: networkToAdd
			};
			await addressRef.set({ watchlists }, { merge: true });
			return NextResponse.json(
				{
					data: responseMessages.success,
					error: null
				},
				{ status: 200 }
			);
		}
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in addAddressToWatchlist :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
