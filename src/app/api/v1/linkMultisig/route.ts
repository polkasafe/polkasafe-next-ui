// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IDBMultisig, IOrganisation } from '@common/types/substrate';
import { EUserType } from '@common/enum/substrate';
import { isValidRequest } from '@common/utils/isValidRequest';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';

const updateDB = async (multisigs: Array<IDBMultisig>) => {
	try {
		await Promise.all(
			multisigs.map(async (multisig) => {
				const docId = `${multisig.address}_${multisig.network}`;
				await MULTISIG_COLLECTION.doc(docId).set({ multisigs }, { merge: true });
			})
		);
	} catch (err: unknown) {
		console.log('Error in updateDB:', err);
	}
};

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

		const { multisigs, organisationId } = await req.json();
		if (!multisigs) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (multisigs.length < 1) {
			return NextResponse.json({ error: ResponseMessages.INVALID_THRESHOLD }, { status: 400 });
		}
		if (organisationId) {
			const organisation = await ORGANISATION_COLLECTION.doc(organisationId).get();
			if (!organisation.exists) {
				return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
			}
			const orgData = organisation.data() as IOrganisation;
			if (!orgData) {
				return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
			}
			const isMember = orgData.members.includes(substrateAddress);
			if (!isMember) {
				return NextResponse.json({ error: ResponseMessages.INVALID_USER }, { status: 400 });
			}
		}

		const payload = multisigs.map((multisig: IDBMultisig) => ({
			...multisig,
			organisationId: organisationId || null,
			type: EUserType.SUBSTRATE,
			created_at: new Date(),
			updated_at: new Date()
		}));
		await updateDB(payload);
		return NextResponse.json({ data: 'success', error: null });
	} catch (err: unknown) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
