// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/naming-convention */

import { NOTIFICATION_ENGINE_API_KEY } from '@next-common/constants/notification_engine_constants';

export default function firebaseFunctionsHeader(
	// network: string,
	address?: string,
	signature?: string,
	contentType?: string
) {
	return {
		Accept: 'application/json',
		'Content-Type': contentType || 'application/json',
		'x-address': address || (typeof window !== 'undefined' && localStorage.getItem('address')) || '',
		'x-api-key': NOTIFICATION_ENGINE_API_KEY,
		// 'x-network': network || (typeof window !== 'undefined' && localStorage.getItem('network')) || '',
		'x-signature': signature || (typeof window !== 'undefined' && localStorage.getItem('signature')) || '',
		'x-source': 'polkasafe'
	};
}
