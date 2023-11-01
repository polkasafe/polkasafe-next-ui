// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { CHANNEL, IAddressBookItem, IUser, IUserNotificationPreferences, IUserResponse } from '@next-common/types';
import { DEFAULT_USER_ADDRESS_NAME } from '@next-common/global/default';
import verifyEthSignature from '@next-common/utils/verifyEthSignature';
import getMultisigAddressesByAddress from '../../api-utils/getMultisigAddressesByAddress';

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

	try {
		const DEFAULT_NOTIFICATION_PREFERENCES: IUserNotificationPreferences = {
			channelPreferences: {
				[CHANNEL.IN_APP]: {
					enabled: true,
					handle: String(address),
					name: CHANNEL.IN_APP,
					verified: true
				}
			},
			triggerPreferences: {}
		};

		const multisigAddresses = await getMultisigAddressesByAddress(address);

		// check if address doc already exists
		if (doc.exists) {
			const data = doc.data();
			if (data && data.created_at) {
				const addressDoc = {
					...data,
					created_at: data?.created_at.toDate()
				} as IUser;

				const resUser: IUserResponse = {
					address: addressDoc.address,
					email: addressDoc.email,
					created_at: addressDoc.created_at,
					addressBook: addressDoc.addressBook,
					multisigAddresses: multisigAddresses.map((item) => ({
						...item,
						signatories: item.signatories.map((signatory) => signatory)
					})),
					multisigSettings: addressDoc.multisigSettings,
					notification_preferences: addressDoc.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES,
					transactionFields: addressDoc.transactionFields
				};

				if (!addressDoc.notification_preferences) {
					// set default notification preferences if not set
					await doc.ref.update({ notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES });
				}

				return NextResponse.json({ data: resUser, error: null }, { status: 200 });
			}
		}

		const newAddress: IAddressBookItem = {
			name: DEFAULT_USER_ADDRESS_NAME,
			address: String(address)
		};

		// else create a new user document
		const newUser: IUser = {
			address: String(address),
			created_at: new Date(),
			email: null,
			addressBook: [newAddress],
			multisigAddresses,
			multisigSettings: {},
			notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES
		};

		await addressRef.set(newUser, { merge: true });
		return NextResponse.json({ data: newUser, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in connectAddress :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
