import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { request } from '../utils/request';

type Props = {
	address: string;
	network: string;
	page?: number;
	limit?: number;
};

export function getTransactionsForMultisig({
	address,
	network,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE
}: Props) {
	if (!address) {
		throw new Error('Multisig address is required');
	}
	if (!Number(page)) {
		throw new Error('Invalid request please check you params');
	}
	if (!Number(limit)) {
		throw new Error('Invalid request please check you params');
	}
	const body = JSON.stringify({
		multisigAddress: address,
		network,
		page,
		limit
	});

	return request('/getTransaction', {}, { method: 'POST', body });
}
