// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/naming-convention */

const NOTIFICATION_ENGINE_API_KEY = '47c058d8-2ddc-421e-aeb5-e2aa99001949';

export default function firebaseFunctionsHeader(address?: string, userID?: string, contentType?: string) {
	return {
		Accept: 'application/json',
		'Content-Type': contentType || 'application/json',
		'x-address': address || (typeof window !== 'undefined' && localStorage.getItem('address')) || '',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		'x-source': 'polkasafe',
		'x-user-id': userID || (typeof window !== 'undefined' && localStorage.getItem('user-id')) || ''
	};
}
