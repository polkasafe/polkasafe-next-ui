import { IGetOrganisationTransactionProps } from '@common/types/sdk';
import { ETransactionType } from '@common/enum/sdk';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants/pagination';
import { request } from '../utils/request';

export function getTransactionsForMultisigs({
	multisigs,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE,
	type
}: IGetOrganisationTransactionProps) {
	if (!multisigs) {
		throw new Error('Multisig address is required');
	}
	if (!Number(page)) {
		throw new Error('Invalid request please check you params');
	}
	if (!Number(limit)) {
		throw new Error('Invalid request please check you params');
	}
	const body = JSON.stringify({
		multisigs,
		page,
		limit
	});
	if (type === ETransactionType.HISTORY_TRANSACTION) {
		return request('/getHistoryTransaction', {}, { method: 'POST', body }) as Promise<{
			data: { transactions: Array<IDBTransaction> };
			error: string | null;
		}>;
	}

	return request('/getQueueTransaction', {}, { method: 'POST', body }) as Promise<{
		data: { transactions: Array<IDBTransaction> };
		error: string | null;
	}>;
}
