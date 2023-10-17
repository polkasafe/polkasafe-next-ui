// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { INotification } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const notificationsQuery = firestoreDB
			.collection('notifications')
			.where('addresses', 'array-contains', substrateAddress)
			.orderBy('created_at', 'desc')
			.limit(10);

		const notificationsSnapshot = await notificationsQuery.get();

		const notifications: INotification[] = notificationsSnapshot.docs.map(
			(doc) =>
				({
					...doc.data(),
					created_at: doc.data().created_at.toDate()
				}) as INotification
		);

		return NextResponse.json({ data: notifications, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getNotifications :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
