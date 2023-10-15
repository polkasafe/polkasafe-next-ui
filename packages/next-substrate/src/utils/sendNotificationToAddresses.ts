// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { INotification } from '@next-common/types';

export default async function sendNotificationToAddresses({
	addresses,
	link = '',
	message,
	network,
	type
}: Omit<INotification, 'created_at' | 'id'>) {
	const newNotificationData: Omit<INotification, 'created_at' | 'id'> = {
		addresses,
		link,
		message,
		network,
		type
	};

	await fetch(`${FIREBASE_FUNCTIONS_URL}/sendNotification`, {
		body: JSON.stringify(newNotificationData),
		headers: firebaseFunctionsHeader(network),
		method: 'POST'
	});
}
