import { IMultisig } from '@common/types/substrate';
import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

type Props = {
	address: string;
	signature: string;
	multisigs: IMultisig[];
	organisationId: string;
};

export function treasuryAnalytics({ address, signature, multisigs, organisationId }: Props) {
	if (!multisigs || !organisationId) {
		throw new Error('organisation and multisigs required');
	}
	const body = JSON.stringify({
		multisigs,
		organisationId
	});
	const headers = handleHeaders({ address, signature });
	return request('/treasuryAnalytics', headers, { method: 'POST', body });
}
