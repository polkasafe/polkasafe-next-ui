import { request } from '../utils/request';

type Props = {
	multisigIds: Array<string>;
};

export function getAssetsForAddress({ multisigIds }: Props) {
	if (!multisigIds) {
		throw new Error('Multisig address is required');
	}
	const body = JSON.stringify({ multisigIds });
	return request('/getAssets', {}, { method: 'POST', body });
}
