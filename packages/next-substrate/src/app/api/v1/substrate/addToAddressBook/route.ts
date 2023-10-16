// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { headers } from 'next/headers';
import { encodeAddress } from '@polkadot/util-crypto';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { chainProperties } from '@next-common/global/networkConstants';
import { IUser } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

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
		const substrateAddressToAdd = getSubstrateAddress(String(addressToAdd));
		if (!substrateAddressToAdd)
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		const doc = await addressRef.get();
		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const addressBook = addressDoc.addressBook || [];

			// check if address already exists in address book
			const addressIndex = addressBook.findIndex((a) => a.address === substrateAddressToAdd);
			if (addressIndex > -1) {
				addressBook[addressIndex] = { name, address: substrateAddressToAdd, roles, email, discord, telegram, nickName };
				await addressRef.set({ addressBook }, { merge: true });
				return NextResponse.json(
					{
						data: addressBook.map((item) => ({
							...item,
							address: encodeAddress(item.address, chainProperties[network].ss58Format)
						})),
						error: null
					},
					{ status: 200 }
				);
			}

			const newAddressBook = [
				...addressBook,
				{ name, address: substrateAddressToAdd, roles, email, discord, telegram, nickName }
			];
			await addressRef.set({ addressBook: newAddressBook }, { merge: true });
			return NextResponse.json(
				{
					data: newAddressBook.map((item) => ({
						...item,
						address: encodeAddress(item.address, chainProperties[network].ss58Format)
					})),
					error: null
				},
				{ status: 200 }
			);
		}
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in addToAddressBook :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
