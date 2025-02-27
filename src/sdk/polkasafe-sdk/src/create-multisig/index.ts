import { request } from '../utils/request';

type Props = {
	signatories: Array<string>;
	threshold: number;
	name: string;
	network: string;
	proxy?: string;
};

export function createMultisig({ signatories, threshold, name, network }: Props) {
	console.log('createMultisig', signatories, threshold, name, network);
	if (!signatories || !signatories.length) {
		throw new Error('You should have at least one signatories');
	}
	if (!threshold) {
		throw new Error('threshold is required');
	}
	if (threshold > signatories.length + 1) {
		throw new Error('threshold can not be grater than total signatories');
	}
	if (!name) {
		throw new Error('multisig name is required');
	}

	const body = JSON.stringify({
		name,
		signatories,
		network,
		threshold
	});
	return request('/createMultisig', {}, { method: 'POST', body });
}
