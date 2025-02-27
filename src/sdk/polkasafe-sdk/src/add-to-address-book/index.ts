import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	name: string;
	addressToAdd: string;
	email?: string;
	discord?: string;
	telegram?: string;
	nickName?: string;
	organisationId: string;
};

export function addToAddressBook({
	address,
	signature,
	name,
	addressToAdd,
	email = '',
	discord = '',
	telegram = '',
	nickName = '',
	organisationId
}: Props) {
	if (!addressToAdd) {
		throw new Error('address is required');
	}
	if (!name) {
		throw new Error('name is required');
	}
	const body = JSON.stringify({
		address: addressToAdd,
		name,
		email,
		discord,
		telegram,
		nickName,
		organisationId
	});
	const headers = handleHeaders({ address, signature });
	return request('/addressBook', headers, { method: 'POST', body });
}
