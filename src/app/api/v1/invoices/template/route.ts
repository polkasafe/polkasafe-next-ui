import { ResponseMessages } from '@common/constants/responseMessage';
import { INVOICE_TEMPLATE_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { IInvoiceTemplate, IOrganisation } from '@common/types/substrate';
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
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { title, from, organisationId, note } = await req.json();

		if (!title || !from || !organisationId) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS });
		}
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

		const createdInvoice: IInvoiceTemplate = {
			organisationId,
			title,
			from,
			note,
			created_at: new Date()
		};
		const data = await INVOICE_TEMPLATE_COLLECTION.add(createdInvoice);
		return NextResponse.json({ data: { ...createdInvoice, id: data.id }, error: null });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
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

		const { title = '', from = '', note = '', templateId } = await req.json();

		if (!templateId) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS });
		}

		const invoiceRef = await INVOICE_TEMPLATE_COLLECTION.doc(templateId).get();

		if (invoiceRef.exists) {
			const data = invoiceRef.data() as IInvoiceTemplate;
			const updatedInvoice: IInvoiceTemplate = {
				...data,
				title: title || data.title,
				from: from || data.from,
				note: note || data.note
			};

			await invoiceRef.ref.set(updatedInvoice, { merge: true });

			return NextResponse.json(
				{
					data: { ...updatedInvoice },
					error: null
				},
				{ status: 200 }
			);
		}
		return NextResponse.json({ data: null, error: ResponseMessages.INVALID_INVOICE_ID });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
