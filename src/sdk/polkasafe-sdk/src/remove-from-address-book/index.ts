import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	addressToDelete: string;
	organisationId: string;
};

export function removeFromAddressBook({ address, signature, addressToDelete, organisationId }: Props) {
	if (!addressToDelete) {
		throw new Error('address is required');
	}

	const body = JSON.stringify({
		address: addressToDelete,
		organisationId
	});

	const headers = handleHeaders({ address, signature });
	return request('/addressBook', headers, { method: 'DELETE', body });
}
