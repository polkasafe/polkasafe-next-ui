import { request } from '../utils/request';

type Props = {
	address: string;
	network: string;
};

export function getMultisigDataByMultisigAddress({ address, network }: Props) {
	if (!address) {
		throw new Error('Multisig address is required');
	}

	const body = JSON.stringify({
		multisigAddress: address,
		network
	});

	return request('/getMultisigData', {}, { method: 'POST', body });
}
