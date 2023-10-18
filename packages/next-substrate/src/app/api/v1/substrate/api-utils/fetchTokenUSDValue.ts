// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { chainProperties } from '@next-common/global/networkConstants';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';

export default async function fetchTokenUSDValue(network: string): Promise<number | null> {
	const res = await fetch(`https://${network}.api.subscan.io/api/open/price_converter`, {
		body: JSON.stringify({
			from: chainProperties[network].tokenSymbol,
			quote: 'USD',
			value: 1
		}),
		headers: SUBSCAN_API_HEADERS,
		method: 'POST'
	});

	const { data: response } = await res.json();

	if (response?.output) {
		return Number(response?.output);
	}
	return null;
}
