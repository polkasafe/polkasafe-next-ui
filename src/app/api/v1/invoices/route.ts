// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { INVOICE_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';

const getReceivedInvoices = async (userAddress: string) => {
	if (!userAddress) {
		return [];
	}
	const organisation = await INVOICE_COLLECTION.where('to', 'array-contains', userAddress).get();

	return organisation.docs.map((doc: any) => {
		const data = doc.data();
		return {
			...data,
			id: doc.id,
			created_at: new Date(data.created_at.toDate()).toString() || new Date().toString()
		};
	});
};

const getOrgInvoices = async (ogId: string) => {
	if (!ogId) {
		return [];
	}
	const orgInvoices = await INVOICE_COLLECTION.where('organisationId', '==', ogId).get();

	return orgInvoices.docs.map((doc: any) => {
		const data = doc.data();
		return {
			...data,
			id: doc.id,
			created_at: new Date(data.created_at.toDate()).toString() || new Date().toString()
		};
	});
};

const getInvoicesByOrganisation = async (organisationId: string, substrateAddress: string) => {
	if (!substrateAddress) {
		return [];
	}
	const organisation = await ORGANISATION_COLLECTION.doc(organisationId).get();
	const orgData = organisation.data();
	const organisationReceivedInvoicePromise = orgData?.multisigs.map((address: string) => getReceivedInvoices(address));
	return Promise.all(organisationReceivedInvoicePromise);
};

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	const organisationId = req?.nextUrl?.searchParams?.get('organisationId');
	try {
		if (!organisationId) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const orgReceivedInvoices = (await getInvoicesByOrganisation(organisationId, substrateAddress)).flat();

		// Invoices
		const sentInvoices = await getOrgInvoices(organisationId);

		const userReceivedInvoices = await getReceivedInvoices(substrateAddress);

		const data = {
			sentInvoices: sentInvoices.flat(),
			orgReceivedInvoices,
			userReceivedInvoices
		};

		return NextResponse.json({ data, error: null });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
