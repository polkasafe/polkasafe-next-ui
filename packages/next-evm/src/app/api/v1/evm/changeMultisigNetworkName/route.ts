// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { NextResponse } from 'next/server';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	try {
		firestoreDB
			.collection('multisigAddresses')
			.where('network', '==', 'etherium')
			.get()
			.then((snapshot) => {
				snapshot.docs.forEach((ds) => {
					const data = ds.data();
					if (String(data.address).startsWith('0x')) {
						ds.ref.update({
							network: 'ethereum'
						});
					}
				});
			});

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in changeName :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
