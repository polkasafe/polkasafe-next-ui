// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { ResponseMessages } from '@common/constants/responseMessage';
import { isValidRequest } from '@common/utils/isValidRequest';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS }, { status: 400 });
		}

		const { multisig, network } = await req.json();

		if (!multisig || !network) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });
		const multisigData = await MULTISIG_COLLECTION.doc(`${multisig}_${network}`).get();
		console.log('multisigData', multisigData.data());
		if (!multisigData.exists) {
			return NextResponse.json({ error: ResponseMessages.ADDRESS_NOT_IN_DB }, { status: 400 });
		}
		const organisationId = multisigData.data()?.organisationId;

		if (!organisationId) {
			const organisation = await ORGANISATION_COLLECTION.where(
				'multisigs',
				'array-contains',
				`${multisig}_${network}`
			).get();
			if (organisation.empty) {
				return NextResponse.json({ error: ResponseMessages.ADDRESS_NOT_IN_DB }, { status: 400 });
			}
		}

		const organisation = await ORGANISATION_COLLECTION.doc(organisationId).get();

		if (organisation.exists) {
			const data = organisation.data();
			const multisigsData = [...new Set(data?.multisigs || [])] as Array<string>;

			const multisigsPromise =
				multisigsData.map(async (multisigId: string) => {
					const multisig = await MULTISIG_COLLECTION.doc(multisigId).get();
					const data = multisig.data() || null;
					if (!data) {
						return null;
					}
					return {
						name: data.name,
						address: data.address,
						network: data.network,
						threshold: data.threshold,
						signatories: data.signatories
					};
				}) || [];
			const multisigs = (await Promise.all(multisigsPromise)).filter((a) => Boolean(a));

			return NextResponse.json({ data: { ...data, multisigs } }, { status: 200 });
		}

		return NextResponse.json({ error: ResponseMessages.ADDRESS_NOT_IN_DB }, { status: 400 });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
