// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSetAtom } from 'jotai/react';
import { useEffect } from 'react';
import { fetchTokenToUSDPrice, getCurrencyPrices } from '@sdk/polkasafe-sdk/src';
import { currencyAtom } from '@substrate/app/atoms/currency/currencyAtom';
import { ENetwork } from '@common/enum/substrate';
import formatUsdWithUnits from 'common/utils/formatUSDWithUnits';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

function InitializeCurrency() {
	const setAtom = useSetAtom(currencyAtom);

	useEffect(() => {
		const handleCurrency = async () => {
			const usdValues: any = {};
			for (const network of Object.values(ENetwork)) {
				// eslint-disable-next-line no-await-in-loop
				const usdValue = await fetchTokenToUSDPrice(1, network);
				const formatted = formatUsdWithUnits(usdValue || 0);
				usdValues[network] = {
						symbol: networkConstants[network].tokenSymbol,
						value: formatted && !Number.isNaN(Number(formatted)) ? formatted : 0
				}
			}
			const currencies = await getCurrencyPrices();
			setAtom({ allCurrencyPrices: currencies.data, tokenUsdPrice: usdValues });
		};
		handleCurrency();
	}, []);

	return null;
}

export default InitializeCurrency;
