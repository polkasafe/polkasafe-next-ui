// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@polkadot/api-augment';

import { createContext, useContext, useEffect, useMemo, useState, Context, ReactNode } from 'react';
import CURRENCY_API_KEY from '@next-common/global/currencyApiKey';
import { currencies, currencyProperties, currencySymbol } from '@next-common/global/currencyConstants';
import fetchTokenToUSDPrice from '@next-substrate/utils/fetchTokentoUSDPrice';
import getCurrency from '@next-substrate/utils/getCurrency';

import { useGlobalApiContext } from './ApiContext';

export interface CurrencyContextType {
	currency: string;
	setCurrency: React.Dispatch<React.SetStateAction<string>>;
	currencyPrice: string;
	allCurrencyPrices: { [symbol: string]: { code: string; value: number } };
	tokenUsdPrice: string;
}

export const CurrencyContext: Context<CurrencyContextType> = createContext({} as CurrencyContextType);

export interface CurrencyContextProviderProps {
	children?: ReactNode;
}

export function CurrencyContextProvider({ children }: CurrencyContextProviderProps): ReactNode {
	const { network } = useGlobalApiContext();
	const [currency, setCurrency] = useState<string>(getCurrency());
	const [currencyPrice, setCurrencyPrice] = useState<string>('1');
	const [tokenUsdPrice, setTokenUsdPrice] = useState<string>('');

	const [allCurrencyPrices, setAllCurrencyPrices] = useState<{ [symbol: string]: { code: string; value: number } }>({});

	useEffect(() => {
		if (!network) return;

		fetchTokenToUSDPrice(1, network).then((formattedUSD: any) => {
			setTokenUsdPrice(parseFloat(formattedUSD).toFixed(2));
		});
	}, [network]);

	useEffect(() => {
		const fetchCurrencyPrice = async () => {
			const fetchPriceRes = await fetch(
				`https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&currencies=${[
					...Object.values(currencySymbol)
				]}`,
				{
					method: 'GET'
				}
			);
			const currencyData = await fetchPriceRes.json();
			if (currencyData.data) {
				setAllCurrencyPrices(currencyData.data);
			}
		};
		fetchCurrencyPrice();
	}, []);

	useEffect(() => {
		setCurrency(getCurrency());
		if (Object.keys(allCurrencyPrices).length > 0) {
			setCurrencyPrice(allCurrencyPrices[currencyProperties[currency].symbol]?.value?.toString());
		} else {
			setCurrency(currencies.UNITED_STATES_DOLLAR);
		}
	}, [allCurrencyPrices, currency]);

	const value = useMemo(
		() => ({ allCurrencyPrices, currency, currencyPrice, setCurrency, tokenUsdPrice }),
		[allCurrencyPrices, currency, currencyPrice, tokenUsdPrice]
	);

	return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useGlobalCurrencyContext() {
	return useContext(CurrencyContext);
}
