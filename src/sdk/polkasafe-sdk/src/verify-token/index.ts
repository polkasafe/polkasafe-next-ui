import { ECHANNEL } from '@common/enum/substrate';
import { handleHeaders } from '../utils/handleHeaders';
import { request } from '../utils/request';

export const verifyToken = async ({
	address,
	signature,
	channel
}: {
	address: string;
	signature: string;
	channel: ECHANNEL;
}) => {
	if (!address || !signature || !channel) {
		throw new Error('address, signature and channel are required');
	}

	const body = JSON.stringify({
		channel
	});

	const option = { method: 'POST', body };

	const headers = handleHeaders({ address, signature });

	return request('/verifyToken', headers, option);
};
