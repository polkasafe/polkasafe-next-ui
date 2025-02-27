import fetchPonyfill from 'fetch-ponyfill';

const { fetch: fetchPF } = fetchPonyfill();

// const baseUrl = 'https://app.polkasafe.xyz/api/v1';

const baseUrl = 'http://localhost:3000/api/v1';

export function request<T>(endpoint: string, reqHeaders?: any, options?: RequestInit): Promise<T> {
	// console.log('baseUrl', baseUrl);
	const url = `${baseUrl}${endpoint}`;
	const headers = {
		Accept: 'application/json',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'Content-Type': 'application/json',
		...reqHeaders
	};
	const config = {
		...options,
		headers
	};
	return fetchPF(url, config)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			console.log('error', error);
			throw new Error(error.message);
		});
}
