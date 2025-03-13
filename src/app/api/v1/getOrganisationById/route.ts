// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { ResponseMessages } from '@common/constants/responseMessage';
import { isValidRequest } from '@common/utils/isValidRequest';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IDBOrganisation } from '@common/types/substrate';
import { transactionFields } from '@substrate/app/api/v1/getOrganisationById/utils/transactionFields';

const getValidProxy = (proxy: string | Array<{ address: string }>) => {
	return typeof proxy === 'string'
		? [{ address: proxy, name: '' }]
		: (proxy || [])
				.map((proxy: { address: string } | string) =>
					typeof proxy === 'string' ? { address: proxy, name: '' } : proxy
				)
				.filter((proxy: { address: string }) => Boolean(proxy.address));
};

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

		const { organisationId } = await req.json();

		if (!organisationId) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const organisation = await ORGANISATION_COLLECTION.doc(organisationId).get();

		if (!organisation.exists) {
			return NextResponse.json({ error: ResponseMessages.ADDRESS_NOT_IN_DB }, { status: 400 });
		}

		const members = organisation.data()?.members || [];

		if (!members.includes(substrateAddress)) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS }, { status: 400 });
		}

		const data = organisation.data() as IDBOrganisation;

		data.members = [...new Set(data?.members || [])] as Array<string>;
		const multisigIds = (data?.multisigs || [])
			.map((multisigId: string | any) => {
				let id = multisigId;
				console.log(id);
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

		const multisigsPromise =
			uniqueMultisigIds.map(async (multisigId: string) => {
				const multisig = await MULTISIG_COLLECTION.doc(multisigId).get();
				const data = multisig.data() || null;
				if (!data) {
					return null;
				}
				return {
					name: data.name?.split('_').join(' '),
					address: data.address,
					network: data.network,
					threshold: data.threshold,
					signatories: data.signatories.map((s: string) => getSubstrateAddress(s)),
					proxy: data.proxy ? getValidProxy(data.proxy) : []
				};
			}) || [];
		const multisigs = (await Promise.all(multisigsPromise)).filter((a) => Boolean(a));

		return NextResponse.json(
			{
				data: {
					...data,
					addressBook: data.addressBook || [],
					multisigs,
					id: organisationId,
					transactionFields: data.transactionFields || transactionFields
				}
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
