import { IDBMultisig, ITransactionFields } from '@common/types/substrate';
import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	signature: string;
	address: string;
	name: string;
	description: string;
	multisigs: Array<IDBMultisig>;
	addressBook?: Array<string>;
	organisationAddress?: string;
	city?: string;
	country?: string;
	image?: string;
	postalCode?: string;
	state?: string;
	taxNumber?: string;
	transactionFields?: ITransactionFields;
	organisationId?: string;
};

export function createOrganisation({
	address,
	signature,
	multisigs,
	name,
	description,
	organisationAddress,
	city,
	country,
	image,
	postalCode,
	state,
	taxNumber
}: Props) {
	if (!name) {
		throw new Error('Invalid address or network');
	}

	const body = JSON.stringify({
		name,
		description,
		multisigs,
		organisationAddress,
		city,
		country,
		imageURI: image,
		postalCode,
		state,
		taxNumber
	});
	return request('/createOrganisation', { ...handleHeaders({ address, signature }) }, { method: 'POST', body });
}

export function updateOrganisation({
	address,
	signature,
	multisigs,
	name,
	description,
	organisationAddress,
	city,
	country,
	image,
	postalCode,
	state,
	taxNumber,
	addressBook,
	transactionFields,
	organisationId
}: Props) {
	if (!name) {
		throw new Error('Invalid address or network');
	}

	const body = JSON.stringify({
		name,
		description,
		multisigs,
		organisationAddress,
		city,
		country,
		imageURL: image,
		postalCode,
		state,
		taxNumber,
		addressBook,
		transactionFields,
		organisationId
	});
	return request('/createOrganisation', { ...handleHeaders({ address, signature }) }, { method: 'PUT', body });
}
