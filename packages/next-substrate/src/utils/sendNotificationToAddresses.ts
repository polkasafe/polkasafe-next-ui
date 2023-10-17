// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import { INotification } from '@next-common/types';
import nextApiClientFetch from './nextApiClientFetch';

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

	await nextApiClientFetch(`${SUBSTRATE_API_URL}/sendNotification`, newNotificationData);
}
