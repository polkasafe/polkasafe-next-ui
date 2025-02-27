import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

function getConnectAddressToken(address: string) {
	if (!address) {
		throw new Error('address are required');
	}
	return {
		endpoint: '/getConnectAddressToken',
		headers: {},
		options: { method: 'POST' }
	};
}

export function getAddressToken(address: string): Promise<any> {
	const { endpoint, headers, options } = getConnectAddressToken(address);
	return request(endpoint, { ...headers, ...handleHeaders({ address }) }, options);
}
