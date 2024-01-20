// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { IOrganisation } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headersList = headers();
	const userID = headersList.get('x-user-id');

	console.log('before');
	if (!userID) {
		return NextResponse.json({ data: null, error: responseMessages.missing_headers }, { status: 400 });
	}
	console.log('afterr');
	const docId = `${userID}`;
	const addressRef = firestoreDB.collection('addresses').doc(docId);
	const doc = await addressRef.get();
	const data = doc.data();

	const { org } = (await req.json()) as {
		org: IOrganisation;
	};
	if (!org || typeof org !== 'object')
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const allOrgs = (data.organisations as IOrganisation[]) || [];

		// eslint-disable-next-line @typescript-eslint/naming-convention
		addressRef.update({ organisations: [...allOrgs, org] });

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in createOrg :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
