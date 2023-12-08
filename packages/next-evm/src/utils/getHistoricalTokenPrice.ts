// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import dayjs from 'dayjs';

// of the Apache-2.0 license. See the LICENSE file for details.
const getHistoricalTokenPrice = async (network: NETWORK, contractAddress: string, date: Date | string) => {
	const days = dayjs(new Date()).diff(dayjs(date), 'day');
	const platformId = chainProperties[network].coingeckoId;
	const data = await fetch(
		`https://api.coingecko.com/api/v3/coins/${platformId}/contract/${contractAddress}/market_chart?vs_currency=usd&days=${
			days + 1
		}&x_cg_demo_api_key=${process.env.NEXT_PUBLIC_POLKASAFE_COINGECKO_API_KEY}`,
		{ method: 'GET' }
	);

	return data.json();
};

export default getHistoricalTokenPrice;
