// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { IUserNotificationTriggerPreferences } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { triggerPreferences } = (await req.json()) as {
		triggerPreferences: { [index: string]: IUserNotificationTriggerPreferences };
	};
	if (!triggerPreferences || typeof triggerPreferences !== 'object')
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		addressRef.update({ 'notification_preferences.triggerPreferences': triggerPreferences });

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in updateNotificationTriggerPreferences :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
