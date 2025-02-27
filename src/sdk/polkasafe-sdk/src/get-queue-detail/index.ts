import { request } from '../utils/request';

type Props = {
	extrinsicBlockWithIndex: string;
	network: string;
};

export function getQueueDetailsForMultisig({ extrinsicBlockWithIndex, network }: Props) {
	if (!extrinsicBlockWithIndex) {
		throw new Error('Extrinsic block with index is required');
	}
	if (!network) {
		throw new Error('Invalid request please check you params');
	}
	const body = JSON.stringify({
		extrinsicId: extrinsicBlockWithIndex,
		network
	});

	return request('/getQueueDetails', {}, { method: 'POST', body });
}
