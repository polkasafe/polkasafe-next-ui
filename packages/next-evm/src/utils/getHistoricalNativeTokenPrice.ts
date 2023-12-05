// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import dayjs from 'dayjs';

// of the Apache-2.0 license. See the LICENSE file for details.
const getHistoricalNativeTokenPrice = async (network: NETWORK, date: Date | string) => {
	const tokenId = chainProperties[network].coingeckoNativeTokenId;
	const formattedDate = dayjs(date).format('DD-MM-YYYY');
	const data = await fetch(
		`https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${formattedDate}&x_cg_demo_api_key=${process.env.NEXT_PUBLIC_POLKASAFE_COINGECKO_API_KEY}`,
		{ method: 'GET' }
	);

	return data.json();
};

export default getHistoricalNativeTokenPrice;
