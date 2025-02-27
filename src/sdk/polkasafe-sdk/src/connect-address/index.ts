import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

export function connectAddress(address: string) {
	if (!address) {
		throw new Error('Invalid signature, use setSignature method to set the signature');
	}
	const headers = handleHeaders({ address });
	return request('/auth/connectAddress', headers, { method: 'POST' });
}
