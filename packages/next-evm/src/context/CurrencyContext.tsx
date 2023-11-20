// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { createContext, useContext, useEffect, useMemo, useState, Context, ReactNode } from 'react';
import CURRENCY_API_KEY from '@next-common/global/currencyApiKey';
import { currencySymbol } from '@next-common/global/currencyConstants';

export interface CurrencyContextType {
	allCurrencyPrices: { [symbol: string]: { code: string; value: number } };
}

export const CurrencyContext: Context<CurrencyContextType> = createContext({} as CurrencyContextType);

export interface CurrencyContextProviderProps {
	children?: ReactNode;
}

export function CurrencyContextProvider({ children }: CurrencyContextProviderProps): ReactNode {
	const [allCurrencyPrices, setAllCurrencyPrices] = useState<{ [symbol: string]: { code: string; value: number } }>({});

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

	const value = useMemo(() => ({ allCurrencyPrices }), [allCurrencyPrices]);

	return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useGlobalCurrencyContext() {
	return useContext(CurrencyContext);
}
