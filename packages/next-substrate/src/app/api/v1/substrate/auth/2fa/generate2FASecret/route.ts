// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { I2FASettings, IGenerate2FAResponse } from '@next-common/types';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { TOTP } from 'otpauth';
import isValidRequest from '../../../api-utils/isValidRequest';
import generateRandomBase32 from '../../../api-utils/generateRandomBase32';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function POST(req: Request) {
	const headerList = headers();
	const address = headerList.get('x-address');
	const signature = headerList.get('x-signature');
	const network = headerList.get('x-network');

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ error }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const base32_secret = generateRandomBase32();

		const totp = new TOTP({
			algorithm: 'SHA1',
			digits: 6,
			issuer: 'Polkasafe',
			label: substrateAddress,
			period: 30,
			secret: base32_secret
		});

		const otpauth_url = totp.toString();

		const addressRef = firestoreDB.collection('addresses').doc(substrateAddress);

		const two_factor_auth: I2FASettings = {
			base32_secret,
			enabled: false,
			url: otpauth_url,
			verified: false
		};

		await addressRef.set({ two_factor_auth }, { merge: true });

		return NextResponse.json(
			{
				data: {
					base32_secret,
					url: otpauth_url
				} as IGenerate2FAResponse,
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error('Error in generate2FASecret : ', err);
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
