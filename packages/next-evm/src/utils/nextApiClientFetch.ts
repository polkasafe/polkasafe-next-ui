// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';

import messages from './messages';

async function nextApiClientFetch<T>(
	url: string,
	data?: { [key: string]: any },
	headers?: { address?: string; userID?: string },
	method?: 'GET' | 'POST'
): Promise<{ data?: T; error?: string }> {
	const response = await fetch(`${typeof window !== 'undefined' && window.location.origin}/${url}`, {
		body: JSON.stringify(data),
		headers: firebaseFunctionsHeader(headers?.address || '', headers?.userID || ''),
		method: method || 'POST'
	});

	const resJSON = await response.json();

	if (response.status === 200)
		return {
			data: resJSON.data as T
		};

	return {
		error: resJSON.error || messages.API_FETCH_ERROR
	};
}

export default nextApiClientFetch;
