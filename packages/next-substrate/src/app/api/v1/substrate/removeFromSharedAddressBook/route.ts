// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { ISharedAddressBooks, IUser } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { address: addresssToRemove, multisigAddress } = await req.json();
	if (!addresssToRemove || !multisigAddress || !address)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	const substrateAddressToRemove = getSubstrateAddress(String(addresssToRemove));
	const substrateMultisigAddress = getSubstrateAddress(String(multisigAddress));
	if (!substrateAddressToRemove || !substrateMultisigAddress)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		const addressBookRef = firestoreDB.collection('addressBooks').doc(`${substrateMultisigAddress}_${network}`);
		const addressBookDoc = await addressBookRef.get();
		const addressBookData = addressBookDoc.data() as ISharedAddressBooks;
		const updatedAddressEntry: ISharedAddressBooks = {
			...addressBookData,
			records: {
				...addressBookData?.records
			}
		};

		delete updatedAddressEntry.records[substrateAddressToRemove];

		await addressBookRef.update({ records: updatedAddressEntry.records });

		const substrateAddress = getSubstrateAddress(address);
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		const doc = await addressRef.get();
		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const addressBook = addressDoc.addressBook || [];

			// check if address exists in address book
			const addressIndex = addressBook.findIndex((a) => a.address === substrateAddressToRemove);
			if (addressIndex > -1) {
				addressBook.splice(addressIndex, 1);
				await addressRef.set({ addressBook }, { merge: true });
			}
		}

		return NextResponse.json({ data: updatedAddressEntry, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in removeFromSharedAddressBook :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
