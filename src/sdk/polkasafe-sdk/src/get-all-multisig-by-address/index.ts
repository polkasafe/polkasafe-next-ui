import { request } from '../utils/request';

type Props = {
	network: string;
	address: string;
};

export function getMultisigsByAddress({ address, network }: Props) {
	if (!address || !network) {
		throw new Error('Invalid address or network');
	}

	const body = JSON.stringify({
		address,
		network
	});
	return request('/getMultisigsByAddress', {}, { method: 'POST', body });
}
