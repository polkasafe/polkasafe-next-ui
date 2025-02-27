/* eslint-disable sonarjs/no-duplicate-string */

import { handleHeaders } from '../../utils/handleHeaders';
import { request } from '../../utils/request';

interface ICreateInvoiceTemplate {
	title: string;
	from: string;
	organisationId: string;
	note: string;
	address: string;
	signature: string;
}

interface IUpdateInvoiceTemplate {
	title: string;
	from: string;
	templateId: string;
	note: string;
	address: string;
	signature: string;
}

export function createInvoiceTemplate({
	title,
	from,
	organisationId,
	note,
	address,
	signature
}: ICreateInvoiceTemplate) {
	if (!title || !from || !organisationId || !address || !signature) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		organisationId,
		title,
		from,
		note
	});
	return request('/invoices/template', handleHeaders({ address, signature }), { method: 'POST', body });
}

export function updateInvoice({ title, from, templateId, note, address, signature }: IUpdateInvoiceTemplate) {
	if (!title || !from || !templateId || !address || !signature) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		templateId,
		title,
		from,
		note
	});
	return request('/invoices/template', handleHeaders({ address, signature }), { method: 'PUT', body });
}
