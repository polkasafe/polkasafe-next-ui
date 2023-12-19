// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
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

		const { address: addressToRemove, network: networkToRemove } = await req.json();
		if (!addressToRemove || !networkToRemove)
			return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
		const substrateAddressToRemove = getSubstrateAddress(String(addressToRemove));
		if (!substrateAddressToRemove)
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		const doc = await addressRef.get();
		if (doc.exists) {
			const addressDoc = {
				...doc.data(),
				created_at: doc.data()?.created_at.toDate()
			} as IUser;
			const watchlists = { ...addressDoc.watchlists } || {};

			delete watchlists[`${substrateAddressToRemove}_${networkToRemove}`];
			await addressRef.update({ watchlists });
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
		console.error('Error in removeFromWatchlist :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
