import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	organisationId: string;
};

export function getOrganisationById({ address, signature, organisationId }: Props) {
	if (!address || !signature || !organisationId) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		organisationId
	});

	const headers = handleHeaders({ address, signature });

	return request('/getOrganisationById', headers, { method: 'POST', body });
}
