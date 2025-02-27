// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { I2FAToken } from '@common/types/substrate';
import { EUserType } from '@common/enum/substrate';
import { ResponseMessages } from '@common/constants/responseMessage';
import { USER_COLLECTION } from '@common/db/collections';
import { v4 as uuidv4 } from 'uuid';

function getLoginToken(): string {
	return `<Bytes>polkasafe-login-${uuidv4()}</Bytes>`;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	if (!address) {
		return NextResponse.json({ error: ResponseMessages.INVALID_HEADERS }, { status: 400 });
	}
	try {
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_HEADERS }, { status: 400 });
		}
		const userRef = USER_COLLECTION.doc(substrateAddress);
		const userDocData = (await userRef.get())?.data?.() || null;

		if (userDocData?.two_factor_auth?.enabled) {
			const tfaToken: I2FAToken = {
				created_at: new Date(),
				token: uuidv4()
			};
			await userRef.set({ tfa_token: tfaToken }, { merge: true });
			return NextResponse.json({ data: { tfa_token: tfaToken }, error: null }, { status: 200 });
		}
		const token = getLoginToken();
		await userRef.set({ token, type: EUserType.SUBSTRATE }, { merge: true });
		return NextResponse.json({ data: token, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.log(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
