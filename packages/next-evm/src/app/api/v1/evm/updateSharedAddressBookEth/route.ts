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
import { ISharedAddressBooks, IUser } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
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

	const {
		name,
		address: addressToAdd,
		multisigAddress,
		email,
		discord,
		telegram,
		roles = [],
		nickName
	} = await req.json();
	if (!name || !addressToAdd || !multisigAddress)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const addressBookRef = firestoreDB.collection('addressBooks').doc(`${multisigAddress}_${network}`);
		const addressBookDoc = await addressBookRef.get();
		const addressBookData = addressBookDoc.data() as ISharedAddressBooks;
		const existingRoles = addressBookData?.roles || [];
		const newRoles = [...new Set([...existingRoles, ...roles])];
		const updatedAddressEntry: ISharedAddressBooks = {
			records: {
				...addressBookData?.records,
				[addressToAdd]: {
					name,
					address: addressToAdd,
					email: email || '',
					discord: discord || '',
					telegram: telegram || '',
					roles: roles || [],
					updated_at: new Date(),
					created_at: new Date(),
					updatedBy: address
				}
			},
			roles: newRoles,
			multisig: multisigAddress
		};

		await addressBookRef.set({ ...updatedAddressEntry }, { merge: true });

		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const addressBook = addressDoc.addressBook || [];

			// check if address already exists in address book
			const addressIndex = addressBook.findIndex((a) => a.address === addressToAdd);
			if (addressIndex > -1) {
				addressBook[addressIndex] = { ...addressBook[addressIndex], nickName };
				await addressRef.set({ addressBook }, { merge: true });
			} else {
				const newAddressBook = [
					...addressBook,
					{ name, address: addressToAdd, roles, email, discord, telegram, nickName }
				];
				await addressRef.set({ addressBook: newAddressBook }, { merge: true });
			}
		}

		return NextResponse.json({ data: updatedAddressEntry, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in updateSharedAddressBook :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
