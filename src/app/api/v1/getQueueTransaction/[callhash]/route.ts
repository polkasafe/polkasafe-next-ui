// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { TRANSACTION_COLLECTION } from '@common/db/collections';
import { isValidRequest } from '@common/utils/isValidRequest';
import { IDashboardTransaction } from '@common/types/substrate';

// Queue transaction for multisig
export const POST = withErrorHandling(async (req: NextRequest, { params }) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	const callhash = params?.callhash;

	try {
		if (!callhash) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { transaction } = (await req.json()) as { transaction: IDashboardTransaction };

		if (!transaction) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const txRef = TRANSACTION_COLLECTION.doc(callhash);
		await txRef.set(transaction, { merge: true });
		return NextResponse.json({ data: transaction, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
