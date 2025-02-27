import { ResponseMessages } from '@common/constants/responseMessage';
import { INVOICE_COLLECTION, ORGANISATION_COLLECTION } from '@common/db/collections';
import { EInvoiceStatus } from '@common/enum/substrate';
import { IInvoice, IOrganisation } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { isValidRequest } from '@common/utils/isValidRequest';
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	const invoiceId = params;
	try {
		if (!invoiceId) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS });
		}
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const docRef = INVOICE_COLLECTION.doc(invoiceId);

		const doc = await docRef.get();

		if (doc.exists) {
			const data = doc.data();
			return NextResponse.json({ data, error: null });
		} else {
			return NextResponse.json({ error: ResponseMessages.INVALID_INVOICE_ID }, { status: 400 });
		}
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const POST = withErrorHandling(async (req: NextRequest, { params }) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	const invoiceId = params;
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { organisationId, title, from, fileURL, amount, note, to, status, network } = await req.json();

		if (!title || !to || !from || !organisationId || !invoiceId) {
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

		const createdInvoice: IInvoice = {
			organisationId,
			title,
			from,
			to: !Array.isArray(to) ? [to] : to,
			network,
			amount,
			note,
			status: {
				current_status: status,
				history: [{ status, updated_at: new Date() }]
			},
			paid_from: null,
			files: fileURL,
			transactionHash: '',
			created_at: new Date()
		};
		const invoiceDocRef = INVOICE_COLLECTION.doc(invoiceId);
		await invoiceDocRef.set(createdInvoice);

		return NextResponse.json({ data: { ...createdInvoice, id: invoiceId }, error: null });
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	const invoiceId = params;
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { status, paid_from, transactionHash = '' } = await req.json();

		if (!status || !invoiceId) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS });
		}
		if (
			![EInvoiceStatus.APPROVED, EInvoiceStatus.PAID, EInvoiceStatus.REJECTED, EInvoiceStatus.PARTIALLY_PAID].includes(
				status
			)
		) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const invoiceDoc = await INVOICE_COLLECTION.doc(invoiceId).get();

		if (invoiceDoc.exists) {
			const data = invoiceDoc.data() as IInvoice;

			const prevPaidFrom = data.paid_from && data.paid_from.length > 0 ? data.paid_from : [];

			let amountPaid = data.amountPaid || '0';
			if (status === EInvoiceStatus.PAID) {
				const currentPaymentInDollars = (paid_from && paid_from[0]?.dollarValue) || '0';
				amountPaid = String(Number(amountPaid) + Number(currentPaymentInDollars));
			}

			const partial = Number(amountPaid) < Number(data.amount);

			const nextStatus: { status: string; updated_at: Date } = {
				status: status === EInvoiceStatus.PAID ? (partial ? EInvoiceStatus.PARTIALLY_PAID : status) : status,
				updated_at: new Date()
			};

			const updatedInvoice = {
				...data,
				status: {
					current_status: status === EInvoiceStatus.PAID ? (partial ? EInvoiceStatus.PARTIALLY_PAID : status) : status,
					history: [nextStatus, ...data.status.history]
				},
				amountPaid,
				paid_from: [...(paid_from || []), ...(prevPaidFrom || [])],
				transactionHash
			};

			await invoiceDoc.ref.set(updatedInvoice, { merge: true });

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
