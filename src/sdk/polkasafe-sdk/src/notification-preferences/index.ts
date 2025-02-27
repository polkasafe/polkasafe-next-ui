import { IChannelPreferences, ITriggerPreferences } from '@common/types/substrate';
import { request } from '../utils/request';
import { handleHeaders } from '../utils/handleHeaders';

type Props = {
	address: string;
	signature: string;
	triggerPreferences?: ITriggerPreferences;
	channelPreferences?: IChannelPreferences;
};

export function notificationPreferences({ address, signature, triggerPreferences, channelPreferences }: Props) {
	if (!address) {
		throw new Error('address is required');
	}
	if (!signature) {
		throw new Error('signature is required');
	}

	const body = JSON.stringify({
		triggerPreferences,
		channelPreferences
	});

	const method = triggerPreferences || channelPreferences ? 'POST' : 'GET';

	const option = method === 'POST' ? { method, body } : { method };

	return request('/notificationPreferences', { ...handleHeaders({ address, signature }) }, option);
}
