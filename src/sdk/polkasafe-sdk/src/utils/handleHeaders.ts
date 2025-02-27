type headers = {
	address?: string;
	network?: string;
	signature?: string;
};

export function handleHeaders(headers: headers) {
	const { address, network, signature } = headers;
	return {
		'x-source': 'polkasafe',
		'x-address': address || '',
		'x-network': network || '',
		'x-signature': signature || ''
	};
}
