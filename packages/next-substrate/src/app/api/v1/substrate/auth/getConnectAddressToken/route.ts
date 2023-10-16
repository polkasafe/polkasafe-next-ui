// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { responseMessages } from '@next-common/constants/response_messages';
import { I2FAToken } from '@next-common/types';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { v4 as uuidv4 } from 'uuid';
import getLoginToken from '@next-substrate/app/api/v1/substrate/api-utils/getLoginToken';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headersList = headers();
	const address = headersList.get('x-address');

	if (!address) return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	if (!getSubstrateAddress(address))
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress || address);
		const addressDocData = (await addressRef.get())?.data?.() || null;

		if (addressDocData?.two_factor_auth?.enabled) {
			const tfaToken: I2FAToken = {
				created_at: new Date(),
				token: uuidv4()
			};

			await addressRef.set({ tfa_token: tfaToken }, { merge: true });

			return NextResponse.json({ data: { tfa_token: tfaToken }, error: null }, { status: 200 });
		}

		const token = getLoginToken();

		await addressRef.set({ address: substrateAddress, token }, { merge: true });
		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getConnectAddressToken :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
