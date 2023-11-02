// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { NOTIFICATION_ENGINE_API_KEY, NOTIFICATION_SOURCE } from '@next-common/constants/notification_engine_constants';
import callNotificationTrigger from '../api-utils/callNotificationTrigger';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const apiKey = headerList.get('x-api-key');
	const source = headerList.get('x-source');

	if (!apiKey || !NOTIFICATION_ENGINE_API_KEY || apiKey !== NOTIFICATION_ENGINE_API_KEY)
		return NextResponse.json({ data: null, error: responseMessages.unauthorised }, { status: 401 });
	if (!source || !Object.values(NOTIFICATION_SOURCE).includes(source as any))
		return NextResponse.json({ data: null, error: responseMessages.invalid_headers }, { status: 400 });

	const { trigger, args } = await req.json();
	console.info('notify called with: ', { args, source, trigger }, { structuredData: true });
	if (!trigger) return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	if (args && (typeof args !== 'object' || Array.isArray(args)))
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		await callNotificationTrigger(source as NOTIFICATION_SOURCE, trigger, args);

		return NextResponse.json({ data: 'Notification(s) sent successfully.', error: null }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in notify :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 400 });
	}
}
