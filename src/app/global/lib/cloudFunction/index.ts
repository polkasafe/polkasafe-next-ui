// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/naming-convention */

import { NOTIFICATION_ENGINE_API_KEY } from '@common/envs';

export const FIREBASE_FUNCTIONS_URL = 'https://us-central1-notification-engine-672e0.cloudfunctions.net/';
// export const FIREBASE_FUNCTIONS_URL = 'http://127.0.0.1:5001/polkasafe-a8042/us-central1';

export function firebaseFunctionsHeader(address: string, signature: string, contentType?: string) {
	console.log(NOTIFICATION_ENGINE_API_KEY, 'NOTIFICATION_ENGINE_API_KEY');
	return {
		Accept: 'application/json',
		'Content-Type': contentType || 'application/json',
		'x-address': address,
		'x-api-key': NOTIFICATION_ENGINE_API_KEY || '',
		'x-signature': signature,
		'x-source': 'polkasafe'
	};
}
