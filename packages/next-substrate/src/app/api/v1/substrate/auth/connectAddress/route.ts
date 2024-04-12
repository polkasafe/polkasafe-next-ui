// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */

import { responseMessages } from '@next-common/constants/response_messages';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { CHANNEL, IAddressBookItem, IUser, IUserNotificationPreferences, IUserResponse } from '@next-common/types';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import isValidRequest from '@next-substrate/app/api/v1/substrate/api-utils/isValidRequest';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getMultisigAddressesByAddress from '@next-substrate/app/api/v1/substrate/api-utils/getMultisigAddressesByAddress';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headersList = headers();
	const signature = headersList.get('x-signature');
	const address = headersList.get('x-address');
	const network = headersList.get('x-network');

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

		const DEFAULT_NOTIFICATION_PREFERENCES: IUserNotificationPreferences = {
			channelPreferences: {
				[CHANNEL.IN_APP]: {
					enabled: true,
					handle: String(substrateAddress),
					name: CHANNEL.IN_APP,
					verified: true
				}
			},
			triggerPreferences: {}
		};
		const multisigAddresses = await getMultisigAddressesByAddress(substrateAddress || address);

		// check if address doc already exists
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress || address);
		const doc = await addressRef.get();

		if (!doc.exists)
			return NextResponse.json({ data: null, error: responseMessages.address_not_in_db }, { status: 404 });

		const data = doc.data();
		if (data && data.created_at) {
			const addressDoc = {
				...data,
				created_at: data?.created_at.toDate()
			} as IUser;

			const resUser: IUserResponse = {
				address: getEncodedAddress(addressDoc.address, network) || addressDoc.address,
				addressBook: addressDoc.addressBook?.map((item) => ({
					...item,
					address: getEncodedAddress(item.address, network) || item.address
				})),
				created_at: addressDoc.created_at,
				email: addressDoc.email,
				multisigAddresses: multisigAddresses.map((item) => ({
					...item,
					signatories: item.signatories.map((signatory) => getEncodedAddress(signatory, network) || signatory)
				})),
				multisigSettings: addressDoc.multisigSettings,
				notification_preferences: addressDoc.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES,
				tfa_token: addressDoc.tfa_token,
				transactionFields: addressDoc.transactionFields,
				two_factor_auth: addressDoc.two_factor_auth,
				userId: getEncodedAddress(addressDoc.address, network) || addressDoc.address,
				watchlists: addressDoc.watchlists
			};

			if (!addressDoc.notification_preferences) {
				await doc.ref.update({ notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES });
			}

			return NextResponse.json({ data: resUser, error: null }, { status: 200 });
		}

		const newAddress: IAddressBookItem = {
			address: String(substrateAddress),
			name: DEFAULT_ADDRESS_NAME
		};

		// else create a new user document
		const newUser: IUser = {
			address: String(substrateAddress),
			addressBook: [newAddress],
			created_at: new Date(),
			email: null,
			multisigAddresses: [],
			multisigSettings: {},
			notification_preferences: DEFAULT_NOTIFICATION_PREFERENCES,
			userId: String(substrateAddress)
		};

		const newUserResponse: IUserResponse = {
			...newUser,
			multisigAddresses
		};

		await addressRef.set(newUser, { merge: true });
		return NextResponse.json({ data: newUserResponse, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in connectAddress :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
