// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ResponseMessages } from '@common/constants/responseMessage';
import { ORGANISATION_COLLECTION } from '@common/db/collections';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		console.log('address', address, 'signature', signature);
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { organisationId } = await req.json();
		if (!organisationId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const organisation = await ORGANISATION_COLLECTION.doc(organisationId).get();
		if (!organisation.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 404 });
		}

		const orgData = organisation.data();

		const members = orgData?.members || [];

		if (!members.includes(substrateAddress)) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS }, { status: 400 });
		}

		const multisigIds = (orgData?.multisigs || [])
			.map((multisigId: string | any) => {
				let id = multisigId;
				if (typeof multisigId !== 'string' && multisigId.address && multisigId.network) {
					id = `${multisigId.address}_${multisigId.network}`;
				}

				if (id.split('_').length <= 1) {
					return null;
				}
				return id;
			})
			.filter((a: string | null) => Boolean(a));

		const uniqueMultisigIds = [...new Set(multisigIds)] as Array<string>;

		return NextResponse.json(
			{
				data: uniqueMultisigIds,
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
