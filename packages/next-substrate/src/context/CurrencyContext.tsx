/* eslint-disable no-restricted-syntax */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@polkadot/api-augment';

import { createContext, useContext, useEffect, useMemo, useState, Context, ReactNode, useCallback } from 'react';
import CURRENCY_API_KEY from '@next-common/global/currencyApiKey';
import { currencies, currencyProperties, currencySymbol } from '@next-common/global/currencyConstants';
import getCurrency from '@next-substrate/utils/getCurrency';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import fetchTokenToUSDPrice from '@next-substrate/utils/fetchTokentoUSDPrice';
import Loader from '@next-common/ui-components/Loader';

export interface CurrencyContextType {
	currency: string;
	setCurrency: React.Dispatch<React.SetStateAction<string>>;
	currencyPrice: string;
	allCurrencyPrices: { [symbol: string]: { code: string; value: number } };
	tokensUsdPrice: { [network: string]: { symbol: string; value: number } };
}

export const CurrencyContext: Context<CurrencyContextType> = createContext({} as CurrencyContextType);

export interface CurrencyContextProviderProps {
	children?: ReactNode;
}

export function CurrencyContextProvider({ children }: CurrencyContextProviderProps): ReactNode {
	const [currency, setCurrency] = useState<string>(getCurrency());
	const [currencyPrice, setCurrencyPrice] = useState<string>('1');
	const [tokensUsdPrice, setTokensUsdPrice] = useState<{ [network: string]: { symbol: string; value: number } }>({});

	const [allCurrencyPrices, setAllCurrencyPrices] = useState<{ [symbol: string]: { code: string; value: number } }>({});

	const [loading, setLoading] = useState<boolean>(false);

	const fetchTokenPrice = useCallback(async () => {
		setLoading(true);
		for (const network of Object.keys(networks)) {
			// eslint-disable-next-line no-await-in-loop
			const usdValue = await fetchTokenToUSDPrice(1, networks[network]);
			setTokensUsdPrice((prev) => ({
				...prev,
				[networks[network]]: {
					symbol: chainProperties[networks[network]].tokenSymbol,
					value: usdValue && !Number.isNaN(Number(usdValue)) ? usdValue : 0
				}
			}));
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchTokenPrice();
	}, [fetchTokenPrice]);

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
		() => ({ allCurrencyPrices, currency, currencyPrice, setCurrency, tokensUsdPrice }),
		[allCurrencyPrices, currency, currencyPrice, tokensUsdPrice]
	);

	return (
		<CurrencyContext.Provider value={value}>
			{loading ? (
				<main className='h-screen w-screen flex items-center justify-center text-2xl bg-bg-main text-white'>
					<Loader size='large' />
				</main>
			) : (
				children
			)}
		</CurrencyContext.Provider>
	);
}

export function useGlobalCurrencyContext() {
	return useContext(CurrencyContext);
}
