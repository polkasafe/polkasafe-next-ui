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
	const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
	const substrateMultisigAddress = getSubstrateAddress(String(multisigAddress));
	if (!substrateAddressToAdd || !substrateMultisigAddress || !address)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	const substrateUserAddress = getSubstrateAddress(address);

	try {
		const addressBookRef = firestoreDB.collection('addressBooks').doc(`${substrateMultisigAddress}_${network}`);
		const addressBookDoc = await addressBookRef.get();
		const addressBookData = addressBookDoc.data() as ISharedAddressBooks;
		const existingRoles = addressBookData.roles || [];
		const newRoles = [...new Set([...existingRoles, ...roles])];
		const updatedAddressEntry: ISharedAddressBooks = {
			multisig: substrateMultisigAddress,
			records: {
				...addressBookData?.records,
				[substrateAddressToAdd]: {
					address: addressToAdd,
					created_at: new Date(),
					discord: discord || '',
					email: email || '',
					name,
					roles: roles || [],
					telegram: telegram || '',
					updatedBy: substrateUserAddress,
					updated_at: new Date()
				}
			},
			roles: newRoles
		};

		await addressBookRef.set({ ...updatedAddressEntry }, { merge: true });

		const addressRef = firestoreDB.collection('addresses').doc(substrateUserAddress);
		const doc = await addressRef.get();
		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const addressBook = addressDoc.addressBook || [];

			// check if address already exists in address book
			const addressIndex = addressBook.findIndex((a) => getSubstrateAddress(a.address) === substrateAddressToAdd);
			if (addressIndex > -1) {
				addressBook[addressIndex] = { ...addressBook[addressIndex], nickName };
				await addressRef.set({ addressBook }, { merge: true });
			} else {
				const newAddressBook = [
					...addressBook,
					{ address: substrateAddressToAdd, discord, email, name, nickName, roles, telegram }
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
