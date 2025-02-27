// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';
import { fetchPF } from '@substrate/app/global/utils/fetchPF';

interface Args {
	url: string;
	data?: { [key: string]: unknown } | FormData;
	headers?: { [key: string]: string };
	method?: 'GET' | 'POST';
}

async function nextApiClientFetch<T>({ url, data, method, headers }: Args): Promise<{ data?: T; error?: string }> {
	const reqURL = url.startsWith('/') ? url.substring(1) : url;

	const response = await fetchPF(`${window.location.origin}/${reqURL}`, {
		body: data instanceof FormData ? data : JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
			...(headers || {})
		},
		method: method ?? (data ? 'POST' : 'GET')
	});

	const resJSON = await response.json();

	if (response.status === 200)
		return {
			data: resJSON as T
		};

	return {
		error: resJSON.message || ERROR_MESSAGES.API_FETCH_ERROR
	};
}

export { nextApiClientFetch };
