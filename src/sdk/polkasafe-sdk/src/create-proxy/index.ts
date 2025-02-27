import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

interface Props {
	multisigAddress: string;
	network: string;
	address: string;
	signature: string;
}

export async function createProxy({ multisigAddress, network, address, signature }: Props) {
	if (!multisigAddress || !network || !address || !signature) {
		throw new Error('Missing parameters');
	}
	const body = JSON.stringify({
		multisigAddress,
		network
	});

	const headers = handleHeaders({ address, signature });
	return request('/createProxy', headers, { method: 'POST', body });
}
