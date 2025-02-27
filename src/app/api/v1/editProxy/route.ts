// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IDBMultisig } from '@common/types/substrate';
import { isValidRequest } from '@common/utils/isValidRequest';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import getEncodedAddress from '@common/utils/getEncodedAddress';

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

		const { newMultisigAddress, network, proxyAddress, oldMultisigAddress, organisationId } = await req.json();

		if (!newMultisigAddress || !network || !proxyAddress || !oldMultisigAddress) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const oldMultisigEncodedAddress = getEncodedAddress(oldMultisigAddress, network);
		const newMultisigEncodedAddress = getEncodedAddress(newMultisigAddress, network);

		const doc = MULTISIG_COLLECTION.doc(`${oldMultisigEncodedAddress}_${network}`);
		const data = await doc.get();

		if (!data.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const oldData = data.data() as IDBMultisig;

		const proxyPayload = (oldData.proxy || []).filter((p) => p.address !== proxyAddress);
		await doc.set({ proxy: proxyPayload }, { merge: true });

		const newDoc = MULTISIG_COLLECTION.doc(`${newMultisigEncodedAddress}_${network}`);
		const newData = await newDoc.get();

		const newMultisigData = newData.data() as IDBMultisig;
		const newProxyPayload = newMultisigData.proxy || [];
		newProxyPayload.push({ address: proxyAddress, name: '' });
		await newDoc.set({ proxy: newProxyPayload }, { merge: true });

		const organisation = ORGANISATION_COLLECTION.doc(organisationId);

		const orgData = await organisation.get();

		if (!orgData.exists) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ORGANISATION_ID }, { status: 400 });
		}
		const orgDataPayload = orgData.data();

		const multisigs = orgDataPayload?.multisigs || [];

		organisation.set({ multisigs: [...multisigs, `${newMultisigEncodedAddress}_${network}`] }, { merge: true });

		return NextResponse.json({ data: 'success', error: null }, { status: 200 });
	} catch (err: unknown) {
		console.log('Error in edit proxy:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
