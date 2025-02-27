/* eslint-disable sonarjs/no-duplicate-string */
import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

interface IInvoicesByOrganisation {
	address: string;
	signature: string;
	organisationId: string;
}

interface IInvoicesById {
	address: string;
	signature: string;
	invoiceId: string;
}

interface ICreateInvoice {
	address: string;
	signature: string;
	organisationId: string;
	title: string;
	to: string[] | string;
	from: string;
	fileURL: string;
	amount: string;
	note: string;
	status: string;
	invoiceId: string;
	network: string;
}

interface IUpdateInvoice {
	address: string;
	signature: string;
	status: string;
	paidFrom?: string;
	invoiceId: string;
	transactionHash?: string;
}

export function invoicesByOrganisation({ address, signature, organisationId }: IInvoicesByOrganisation) {
	if (!address || !signature || !organisationId) {
		throw new Error('Invalid Params');
	}

	return request(`/invoices?organisationId=${organisationId}`, handleHeaders({ address, signature }), {
		method: 'GET'
	});
}

export function invoiceById({ address, signature, invoiceId }: IInvoicesById) {
	if (!address || !signature || !invoiceId) {
		throw new Error('Invalid Params');
	}

	return request(`/invoices/${invoiceId}`, handleHeaders({ address, signature }), { method: 'GET' });
}

export function createInvoice({
	address,
	signature,
	organisationId,
	title,
	from,
	fileURL,
	amount,
	note,
	status,
	network,
	invoiceId
}: ICreateInvoice) {
	if (
		!address ||
		!signature ||
		!organisationId ||
		!title ||
		!from ||
		!fileURL ||
		!amount ||
		!note ||
		!status ||
		!invoiceId ||
		!network
	) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		organisationId,
		status
	});
	return request(`/invoices/${invoiceId}`, handleHeaders({ address, signature }), { method: 'POST', body });
}

export function updateInvoice({ address, signature, status, paidFrom, invoiceId, transactionHash }: IUpdateInvoice) {
	if (!address || !signature || !status || !invoiceId) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		status,
		paid_from: paidFrom,
		invoiceId,
		transactionHash
	});
	return request(`/invoices/${invoiceId}`, handleHeaders({ address, signature }), { method: 'PUT', body });
}
