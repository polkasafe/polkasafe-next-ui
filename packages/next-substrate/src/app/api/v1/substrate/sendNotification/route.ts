// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { INotification } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { addresses, link, message, type } = await req.json();
	if (!addresses || !Array.isArray(addresses) || !message || !network)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		const newNotificationRef = firestoreDB.collection('notifications').doc();

		const newNotification: INotification = {
			addresses,
			created_at: new Date(),
			id: newNotificationRef.id,
			link: link ? String(link) : '',
			message,
			network,
			type
		};

		await newNotificationRef.set(newNotification);

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in sendNotification :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
