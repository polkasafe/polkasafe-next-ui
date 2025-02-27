// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { ResponseMessages } from '@common/constants/responseMessage';
import { isValidRequest } from '@common/utils/isValidRequest';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import { onChainHistoryTransaction } from '@substrate/app/api/api-utils/onChainHistoryTransaction';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		// const substrateAddress = getSubstrateAddress(String(address));
		// if (!substrateAddress) {
		// 	return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		// }

		// // check if signature is valid
		// const { isValid, error } = await isValidRequest(substrateAddress, signature);
		// if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const { multisigAddress, limit, page, network } = await req.json();
		if (!multisigAddress || !network || Number.isNaN(limit) || Number.isNaN(page)) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (Number(limit) > 100 || Number(limit) <= 0) {
			return NextResponse.json({ error: ResponseMessages.INVALID_LIMIT }, { status: 400 });
		}
		if (Number(page) <= 0) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PAGE }, { status: 400 });
		}

		const encodedMultisigAddress = getEncodedAddress(multisigAddress, network);
		if (!encodedMultisigAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS }, { status: 400 });
		}
		const {
			data: { transactions: historyItemsArr, count },
			error: historyItemsError
		} = await onChainHistoryTransaction(encodedMultisigAddress, network, Number(limit), Number(page));

		if (historyItemsError || !historyItemsArr) {
			return NextResponse.json({ error: historyItemsError || ResponseMessages.QUEUE_FETCH_ERROR }, { status: 400 });
		}

		return NextResponse.json(
			{
				data: { count, transactions: historyItemsArr },
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
