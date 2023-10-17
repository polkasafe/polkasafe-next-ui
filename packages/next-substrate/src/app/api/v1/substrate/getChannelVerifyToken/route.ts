// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { NOTIFICATION_ENGINE_API_KEY, NOTIFICATION_SOURCE } from '@next-common/constants/notification_engine_constants';
import { CHANNEL } from '@next-common/types';
import getSourceFirebaseAdmin from '../api-utils/getSourceFirebaseAdmin';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headersList = headers();
	const address = headersList.get('x-address');
	const apiKey = headersList.get('x-api-key');
	const source = headersList.get('x-source');

	if (source === NOTIFICATION_SOURCE.POLKASAFE && !address)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	if (source === NOTIFICATION_SOURCE.POLKASAFE && !getSubstrateAddress(address || ''))
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY)
		return NextResponse.json({ data: null, error: responseMessages.unauthorised }, { status: 401 });
	if (!source || !Object.values(NOTIFICATION_SOURCE).includes(source as any))
		return NextResponse.json({ data: null, error: responseMessages.invalid_headers }, { status: 400 });

	const { channel, userId = null } = (await req.json()) as { channel: CHANNEL; userId: number | string | null };
	if (!channel) return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const token = uuidv4();

		if (source === NOTIFICATION_SOURCE.POLKASAFE) {
			const substrateAddress = getSubstrateAddress(String(address));
			const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
			await addressRef.update({ [`notification_preferences.channelPreferences.${channel}.verification_token`]: token });
		} else if (source === NOTIFICATION_SOURCE.POLKASSEMBLY) {
			if (Number.isNaN(Number(userId)))
				return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

			const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASSEMBLY);

			const paUserDoc = await firestore_db.collection('users').doc(String(userId)).get();
			if (!paUserDoc.exists)
				return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

			const token_expires_at = new Date();
			token_expires_at.setDate(token_expires_at.getDate() + 3);

			await paUserDoc.ref.update({
				[`notification_preferences.channelPreferences.${channel}.verification_token`]: token,
				[`notification_preferences.channelPreferences.${channel}.verification_token_expires`]: token_expires_at
			});
		}

		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getChannelVerifyToken :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
