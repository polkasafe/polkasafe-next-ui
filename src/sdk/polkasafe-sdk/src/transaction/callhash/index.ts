import { IGenericObject } from '@common/types/substrate';
import { request } from '../../utils/request';
import { handleHeaders } from '../../utils/handleHeaders';

interface IUpdateTransaction {
	address: string;
	signature: string;
	callhash: string;
	transaction: IGenericObject;
}

export function updateTransaction({ address, signature, callhash, transaction }: IUpdateTransaction) {
	if (!address || !signature || !callhash || !transaction) {
		throw new Error('Invalid Params');
	}

	const body = JSON.stringify({
		transaction
	});
	return request(`/getQueueTransaction/${callhash}`, handleHeaders({ address, signature }), { method: 'POST', body });
}
