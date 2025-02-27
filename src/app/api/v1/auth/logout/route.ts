// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { ResponseMessages } from '@common/constants/responseMessage';
import { isValidRequest } from '@common/utils/isValidRequest';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const response = NextResponse.json({ data: ResponseMessages.SUCCESS }, { status: 200 });
		response.cookies.delete('__session');
		return response;
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
