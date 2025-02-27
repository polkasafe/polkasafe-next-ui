import { ITransactionFields } from '@common/types/substrate';
import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	transactionFields: ITransactionFields;
	organisationId: string;
};

export function addNewCategory({ address, signature, transactionFields, organisationId }: Props) {
	if (!transactionFields) {
		throw new Error('transactionFields is required');
	}
	const body = JSON.stringify({
		transactionFields,
		organisationId
	});
	const headers = handleHeaders({ address, signature });
	return request('/transactionField', headers, { method: 'POST', body });
}
