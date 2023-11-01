// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EVM_API_URL } from '@next-common/global/apiUrls';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import nextApiClientFetch from './nextApiClientFetch';

export default async function notify({
	network,
	triggerName,
	args
}: {
	network: string;
	triggerName: string;
	args: any;
}) {
	try {
		const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
		const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

		if (!userAddress || !signature) {
			console.log('ERROR');
			return { error: 'Invalid User' };
		}
		const { data: notifyData, error: notifyError } = await nextApiClientFetch<string>(
			`${EVM_API_URL}/notify`,
			{
				args,
				trigger: triggerName
			},
			{ network }
		);

		if (notifyData && !notifyError) {
			queueNotification({
				header: 'Notification Sent',
				message: '',
				status: NotificationStatus.SUCCESS
			});
			return { message: 'success' };
		}
		return { error: notifyError };
	} catch (error) {
		console.log('ERROR', error);
		return { error };
	}
}
