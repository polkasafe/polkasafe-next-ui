import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	multisig: string;
	network: string;
};

export function getOrganisationByMultisig({ address, signature, multisig, network }: Props) {
	if (!address || !signature || !multisig || !network) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		multisig,
		network
	});

	const headers = handleHeaders({ address, signature });

	return request('/getOrganisationByMultisig', headers, { method: 'POST', body });
}
