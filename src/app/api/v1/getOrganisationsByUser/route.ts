// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IOrganisation } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';

const getOrganisations = async (address: string) => {
	const organisations = await ORGANISATION_COLLECTION.where('members', 'array-contains', address).get();
	return organisations.docs.map((doc: any) => {
		const data = doc.data();
		return {
			name: data.name,
			id: doc.id,
			image: data.imageUri,
			members: [...new Set(...[data.members])]
		} as unknown as IOrganisation;
	});
};

const getDataFromDB = async (docId: string) => {
	const orgRef = await ORGANISATION_COLLECTION.doc(docId).get();
	if (orgRef.exists) {
		const orgData = orgRef.data();

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

		const multisigsData = uniqueMultisigIds.map(async (multisigId: string | any) => {
			if (multisigId.split('_').length <= 1) {
				return null;
			}
			const multisigRef = await MULTISIG_COLLECTION.doc(multisigId).get();
			if (multisigRef.exists) {
				return multisigRef.data();
			}
			return null;
		});
		const data = {
			name: orgData?.name || '',
			id: docId,
			multisigs: (await Promise.all(multisigsData)).filter((a) => Boolean(a)),
			imageURI: orgData?.imageURI || ''
		};
		return data;
	}
	return null;
};

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { address } = await req.json();
		if (!address) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const organisations = await getOrganisations(substrateAddress);

		const data = (
			await Promise.all(organisations.map(async (organisation) => await getDataFromDB(organisation.id)))
		).filter((a) => Boolean(a));

		if (data.length > 0) {
			return NextResponse.json(
				{
					data,
					error: null
				},
				{ status: 200 }
			);
		}
		return NextResponse.json(
			{
				data: null,
				error: 'Not Fount'
			},
			{ status: 400 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
