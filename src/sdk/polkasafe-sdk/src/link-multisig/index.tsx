import { IDBMultisig } from '@common/types/substrate';
import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

type Props = {
	address: string;
	organisationId: string;
	signature: string;
	multisigs: Array<IDBMultisig>;
};

export function linkMultisig({ address, multisigs, signature, organisationId }: Props) {
	if (!address) {
		throw new Error('address is required');
	}
	if (!multisigs) {
		throw new Error('threshold is required');
	}
	if (multisigs.length < 1) {
		throw new Error('threshold can not be grater than total signatories');
	}
	if (!organisationId) {
		throw new Error('organisationId is required');
	}

	const body = JSON.stringify({
		multisigs,
		organisationId
	});
	return request('/linkMultisig', { ...handleHeaders({ address, signature }) }, { method: 'POST', body });
}
