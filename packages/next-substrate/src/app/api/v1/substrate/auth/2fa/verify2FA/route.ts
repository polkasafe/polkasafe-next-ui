// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { TOTP } from 'otpauth';
import { I2FASettings, IUser } from '@next-common/types';
import isValidRequest from '../../../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headerList = headers();
	const address = headerList.get('x-address');
	const signature = headerList.get('x-signature');
	const network = headerList.get('x-network');

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { authCode = null } = await req.json();
	if (Number.isNaN(authCode))
		return NextResponse.json({ data: null, error: responseMessages.invalid_2fa_code }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);
		const addressDoc = await addressRef.get();
		const addressData = addressDoc.data() as IUser;

		if (!addressData?.two_factor_auth?.base32_secret)
			return NextResponse.json({ data: null, error: responseMessages.two_factor_auth_not_init }, { status: 400 });

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

		const new2FASettings: I2FASettings = {
			...(addressData.two_factor_auth || ({} as I2FASettings)),
			enabled: true,
			verified: true
		};

		await addressRef.set({ two_factor_auth: new2FASettings }, { merge: true });

		const newUser: IUser = {
			...addressData,
			two_factor_auth: new2FASettings
		};

		return NextResponse.json({ data: newUser, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in verify2FA : ', err);
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
