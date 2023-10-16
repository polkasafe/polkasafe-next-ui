// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import firebaseAdmin, { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { TOTP } from 'otpauth';
import dayjs from 'dayjs';
import { IUser } from '@next-common/types';
import getLoginToken from '../../../api-utils/getLoginToken';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headerList = headers();
	const address = headerList.get('x-address');
	if (!address) return NextResponse.json({ error: responseMessages.missing_headers });
	if (!getSubstrateAddress(address)) return NextResponse.json({ error: responseMessages.invalid_headers });

	const { authCode = null, tfa_token = null } = await req.json();
	console.log(authCode, tfa_token);
	if (Number.isNaN(authCode))
		return NextResponse.json({ data: null, error: responseMessages.invalid_2fa_code }, { status: 400 });
	if (!tfa_token) return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		const addressDoc = await addressRef.get();
		if (!addressDoc.exists)
			return NextResponse.json({ data: null, error: responseMessages.address_not_registered }, { status: 400 });

		const data = addressDoc.data();
		const addressData = {
			...data,
			tfa_token: {
				...data?.tfa_token,
				created_at: data?.tfa_token?.created_at?.toDate()
			}
		} as IUser;

		if (!addressData.two_factor_auth?.enabled || !addressData.two_factor_auth?.base32_secret)
			return NextResponse.json({ data: null, error: responseMessages.two_factor_auth_not_init }, { status: 400 });
		if (
			!addressData.tfa_token?.token ||
			!addressData.tfa_token?.created_at ||
			tfa_token !== addressData.tfa_token?.token
		)
			return NextResponse.json({ data: null, error: responseMessages.invalid_2fa_token }, { status: 400 });

		// check if the token is expired (in 5 minutes)
		const isTokenExpired = dayjs().diff(dayjs(addressData.tfa_token?.created_at), 'minute') > 5;
		if (isTokenExpired)
			return NextResponse.json({ data: null, error: responseMessages.tfa_token_expired }, { status: 400 });

		const totp = new TOTP({
			algorithm: 'SHA1',
			digits: 6,
			issuer: 'Polkasafe',
			label: substrateAddress,
			period: 30,
			secret: addressData.two_factor_auth?.base32_secret
		});

		const isValidToken = totp.validate({ token: String(authCode).replaceAll(/\s/g, ''), window: 1 }) !== null;
		if (!isValidToken)
			return NextResponse.json({ data: null, error: responseMessages.invalid_2fa_code }, { status: 400 });

		const token = getLoginToken();

		await addressRef.set({ address: substrateAddress, token }, { merge: true });
		// delete the token
		await addressRef.set({ tfa_token: firebaseAdmin.firestore.FieldValue.delete() }, { merge: true });

		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in validate2FA : ', err);
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
