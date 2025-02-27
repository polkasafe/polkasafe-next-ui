// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ICurrency } from '@common/types/substrate';
import { atom, useAtom } from 'jotai';
import { currencies, currency, getCurrencySymbol } from '@common/constants/currencyConstants';

export const currencyAtom = atom<ICurrency | null>(null);
let preferCurrency: string = currency.USD;
try {
	preferCurrency = window === undefined ? currency.USD : localStorage.getItem('currency') || currency.USD;
} catch (error) {}

preferCurrency = getCurrencySymbol(preferCurrency);

export const selectedCurrencyAtom = atom<string>(preferCurrency);
export const allCurrencyPriceAtom = atom<any>(null);

export const useCurrency = () => useAtom(selectedCurrencyAtom);
export const useAllCurrencyPrice = () => useAtom(allCurrencyPriceAtom);
