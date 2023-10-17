// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { IContactFormResponse } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const { name, email, message } = await req.json();
	if (!name || !email || !message)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const contactFormResponseRef = firestoreDB.collection('contactFormResponses').doc();
		const newContactFormResponse: IContactFormResponse = {
			email: String(email),
			message: String(message),
			name: String(name)
		};

		await contactFormResponseRef.set(newContactFormResponse);

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in addContactFormResponse :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
