// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const { email, token } = await req.json();
	if (!email || !token)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const addressSnapshot = await firestoreDB
			.collection('addresses')
			.where('notification_preferences.channelPreferences.email.verification_token', '==', token)
			.where('notification_preferences.channelPreferences.email.handle', '==', email)
			.limit(1)
			.get();
		if (addressSnapshot.empty)
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
		const addressDoc = addressSnapshot.docs[0];
		const addressDocData = addressDoc.data();
		const verifyEmail = addressDocData?.notification_preferences?.channelPreferences?.email?.handle;
		const verifyToken = addressDocData?.notification_preferences?.channelPreferences?.email?.verification_token;
		if (token === verifyToken && email === verifyEmail) {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			addressDoc.ref.update({ 'notification_preferences.channelPreferences.email.verified': true });
			return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
		}
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in verifyEmail :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
