import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

type Props = {
	address: string;
	signature: string;
	email: string;
};

export function verifyEmail({ address, signature, email }: Props) {
	if (!address) {
		throw new Error('address is required');
	}
	if (!signature) {
		throw new Error('signature is required');
	}
	if (!email) {
		throw new Error('email is required');
	}

	const body = JSON.stringify({
		email
	});

	const option = { method: 'POST', body };

	return request('/verifyEmail', { ...handleHeaders({ address, signature }) }, option);
}
