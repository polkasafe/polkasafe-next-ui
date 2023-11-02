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
import { IUser } from '@next-common/types';

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

	if (!doc.exists) return NextResponse.json({ data: null, error: responseMessages.address_not_in_db }, { status: 404 });
	const addressData = doc.data();
	token = addressData?.token;
	const isValid = await verifyEthSignature(address, signature, token);
	if (!isValid) return NextResponse.json({ data: null, error: responseMessages.invalid_signature }, { status: 400 });

	const {
		name,
		address: addressToAdd,
		roles = [],
		email = '',
		discord = '',
		telegram = '',
		nickName = ''
	} = await req.json();
	if (!name || !addressToAdd)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	const addressDoc = {
		...addressData,
		created_at: doc.data()?.created_at.toDate()
	} as IUser;
	const addressBook = addressDoc.addressBook || [];

	// check if address already exists in address book
	const addressIndex = addressBook.findIndex((a) => a.address === addressToAdd);
	if (addressIndex > -1) {
		addressBook[addressIndex] = { name, address: addressToAdd, roles, email, discord, telegram, nickName };
		await addressRef.set({ addressBook }, { merge: true });
		return NextResponse.json(
			{
				data: addressBook.map((item) => ({
					...item,
					address: item.address
				})),
				error: null
			},
			{ status: 200 }
		);
	}

	try {
		const newAddressBook = [...addressBook, { name, address: addressToAdd, roles, email, discord, telegram, nickName }];
		await addressRef.set({ addressBook: newAddressBook }, { merge: true });
		return NextResponse.json({ data: newAddressBook, error: null }, { status: 200 });
	} catch (err) {
		console.error('Error in addToAddressBook :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
