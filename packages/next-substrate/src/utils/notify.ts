// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

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
		const notifyRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
			body: JSON.stringify({
				args,
				trigger: triggerName
			}),
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: notifyData, error: notifyError } = (await notifyRes.json()) as { data: string; error: string };

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
