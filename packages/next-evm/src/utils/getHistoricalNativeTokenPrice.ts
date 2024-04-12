// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import dayjs from 'dayjs';

const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

// of the Apache-2.0 license. See the LICENSE file for details.
const getHistoricalNativeTokenPrice = async (network: NETWORK, date: Date | string): Promise<number | string> => {
	const formattedDate = dayjs(date).format('YYYY-MM-DD');
	const data = await fetch(
		`https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${
			chainProperties[network].covalentNetworkName || ''
		}/USD/${NATIVE_TOKEN_ADDRESS}/?key=${
			process.env.NEXT_PUBLIC_COVALENT_API_KEY
		}&from=${formattedDate}&to=${formattedDate}`,
		{ method: 'GET' }
	);

	const res = await data.json();

	if (res.data && res.data[0] && !res.error) {
		return res?.data[0]?.prices?.[0]?.price || 0;
	}

	return 0;
};

export default getHistoricalNativeTokenPrice;
