import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

interface Props {
	organisationId: string;
	oldMultisigAddress: string;
	newMultisigAddress: string;
	network: string;
	address: string;
	signature: string;
	proxyAddress: string;
}

export async function editProxy({
	organisationId,
	oldMultisigAddress,
	newMultisigAddress,
	network,
	address,
	signature,
	proxyAddress
}: Props) {
	if (!organisationId || !newMultisigAddress || !oldMultisigAddress || !network || !address || !signature) {
		throw new Error('Missing parameters');
	}
	const body = JSON.stringify({
		organisationId,
		oldMultisigAddress,
		newMultisigAddress,
		network,
		proxyAddress
	});

	const headers = handleHeaders({ address, signature });
	return request('/editProxy', headers, { method: 'POST', body });
}
