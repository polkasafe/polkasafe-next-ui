import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

export function logout({ address, signature }: { address: string; signature: string }) {
	if (!address || !signature) {
		throw new Error('Invalid signature, use setSignature method to set the signature');
	}
	const headers = handleHeaders({ address, signature });
	return request('/auth/logout', headers, { method: 'POST' });
}
