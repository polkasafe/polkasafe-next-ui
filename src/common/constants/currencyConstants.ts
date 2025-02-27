// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-shadow */

import aedLogo from '@common/assets/currency-flags/aed.png';
import audLogo from '@common/assets/currency-flags/aud.png';
import cadLogo from '@common/assets/currency-flags/cad.png';
import chfLogo from '@common/assets/currency-flags/chf.png';
import eurLogo from '@common/assets/currency-flags/eur.png';
import gbpLogo from '@common/assets/currency-flags/gbp.png';
import inrLogo from '@common/assets/currency-flags/inr.png';
import jpyLogo from '@common/assets/currency-flags/jpy.png';
import usdLogo from '@common/assets/currency-flags/usd.png';

export type Currency = (typeof currencies)[keyof typeof currencies];
export type CurrencySymbol = (typeof currencySymbol)[keyof typeof currencySymbol];

export interface CurrencyProps {
	logo?: any;
	symbol: CurrencySymbol;
}

export type CurrencyPropType = {
	[index: string]: CurrencyProps;
};

export const currencies = {
	UNITED_STATES_DOLLAR: 'United States Dollar',
	BRITISH_POUND: 'British Pound',
	EURO: 'Euro',
	SWISS_FRANC: 'Swiss Franc',
	UNITED_ARAB_EMIRATES_DIRHAM: 'United Arab Emirates Dirham',
	JAPANESE_YEN: 'Japanese Yen',
	AUSTRALIAN_DOLLAR: 'Australian Dollar',
	CANADIAN_DOLLAR: 'Canadian Dollar',
	INDIAN_RUPEE: 'Indian Rupee'
};

export const currency = {
	USD: 'USD',
	GBP: 'GBP',
	EUR: 'EUR',
	CHF: 'CHF',
	AED: 'AED',
	JPY: 'JPY',
	AUD: 'AUD',
	CAD: 'CAD',
	INR: 'INR'
};

export const currencySymbol = {
	USD: 'USD',
	GBP: 'GBP',
	EUR: 'EUR',
	CHF: 'CHF',
	AED: 'AED',
	JPY: 'JPY',
	AUD: 'AUD',
	CAD: 'CAD',
	INR: 'INR'
};

export const currencySymbols = {
	USD: '$',
	GBP: '£',
	EUR: '€',
	CHF: 'CHF',
	AED: 'AED',
	JPY: '¥',
	AUD: 'A$',
	CAD: 'C$',
	INR: '₹'
};

export const getCurrenciesBySymbol = (symbol: CurrencySymbol) => {
	switch (symbol) {
		case currencySymbol.USD:
			return currencies.UNITED_STATES_DOLLAR;
		case currencySymbol.EUR:
			return currencies.EURO;
		case currencySymbol.GBP:
			return currencies.BRITISH_POUND;
		case currencySymbol.JPY:
			return currencies.JAPANESE_YEN;
		case currencySymbol.INR:
			return currencies.INDIAN_RUPEE;
		case currencySymbol.AUD:
			return currencies.AUSTRALIAN_DOLLAR;
		case currencySymbol.CAD:
			return currencies.CANADIAN_DOLLAR;
		case currencySymbol.CHF:
			return currencies.SWISS_FRANC;
		case currencySymbol.AED:
			return currencies.UNITED_ARAB_EMIRATES_DIRHAM;
		default:
			return currencies.UNITED_STATES_DOLLAR;
	}
};

export const getCurrencySymbol = (currency: Currency) => {
	switch (currency) {
		case currencies.UNITED_STATES_DOLLAR:
			return currencySymbol.USD;
		case currencies.EURO:
			return currencySymbol.EUR;
		case currencies.BRITISH_POUND:
			return currencySymbol.GBP;
		case currencies.JAPANESE_YEN:
			return currencySymbol.JPY;
		case currencies.INDIAN_RUPEE:
			return currencySymbol.INR;
		case currencies.AUSTRALIAN_DOLLAR:
			return currencySymbol.AUD;
		case currencies.CANADIAN_DOLLAR:
			return currencySymbol.CAD;
		case currencies.SWISS_FRANC:
			return currencySymbol.CHF;
		case currencies.UNITED_ARAB_EMIRATES_DIRHAM:
			return currencySymbol.AED;
		default:
			return currency;
	}
};

export const getCurrencyLogo = (currency: Currency) => {
	switch (currency) {
		case currencies.UNITED_STATES_DOLLAR:
			return usdLogo;
		case currencies.EURO:
			return eurLogo;
		case currencies.BRITISH_POUND:
			return gbpLogo;
		case currencies.JAPANESE_YEN:
			return jpyLogo;
		case currencies.INDIAN_RUPEE:
			return inrLogo;
		case currencies.AUSTRALIAN_DOLLAR:
			return audLogo;
		case currencies.CANADIAN_DOLLAR:
			return cadLogo;
		case currencies.SWISS_FRANC:
			return chfLogo;
		case currencies.UNITED_ARAB_EMIRATES_DIRHAM:
			return aedLogo;
		default:
			return usdLogo;
	}
};

export const getCurrencySymbolByCurrency = (currency: Currency) => {
	switch (currency) {
		case currencySymbol.USD:
			return currencySymbols.USD;
		case currencySymbol.EUR:
			return currencySymbols.EUR;
		case currencySymbol.GBP:
			return currencySymbols.GBP;
		case currencySymbol.JPY:
			return currencySymbols.JPY;
		case currencySymbol.INR:
			return currencySymbols.INR;
		case currencySymbol.AUD:
			return currencySymbols.AUD;
		case currencySymbol.CAD:
			return currencySymbols.CAD;
		case currencySymbol.CHF:
			return currencySymbols.CHF;
		case currencySymbol.AED:
			return currencySymbols.AED;
		default:
			return currencySymbols.USD;
	}
};

export const currencyProperties: CurrencyPropType = {
	[currencies.UNITED_STATES_DOLLAR]: {
		logo: usdLogo,
		symbol: currencySymbol.USD
	},
	[currencies.BRITISH_POUND]: {
		logo: gbpLogo,
		symbol: currencySymbol.GBP
	},
	[currencies.EURO]: {
		logo: eurLogo,
		symbol: currencySymbol.EUR
	},
	[currencies.SWISS_FRANC]: {
		logo: chfLogo,
		symbol: currencySymbol.CHF
	},
	[currencies.UNITED_ARAB_EMIRATES_DIRHAM]: {
		logo: aedLogo,
		symbol: currencySymbol.AED
	},
	[currencies.JAPANESE_YEN]: {
		logo: jpyLogo,
		symbol: currencySymbol.JPY
	},
	[currencies.AUSTRALIAN_DOLLAR]: {
		logo: audLogo,
		symbol: currencySymbol.AUD
	},
	[currencies.CANADIAN_DOLLAR]: {
		logo: cadLogo,
		symbol: currencySymbol.CAD
	},
	[currencies.INDIAN_RUPEE]: {
		logo: inrLogo,
		symbol: currencySymbol.INR
	}
};

export const allCurrencies = {
	[currency.USD]: {
		logo: usdLogo,
		symbol: currencySymbols.USD,
		name: currencies.UNITED_STATES_DOLLAR
	},
	[currency.GBP]: {
		logo: gbpLogo,
		symbol: currencySymbols.GBP,
		name: currencies.BRITISH_POUND
	},
	[currency.EUR]: {
		logo: eurLogo,
		symbol: currencySymbols.EUR,
		name: currencies.EURO
	},
	[currency.CHF]: {
		logo: chfLogo,
		symbol: currencySymbols.CHF,
		name: currencies.SWISS_FRANC
	},
	[currency.AED]: {
		logo: aedLogo,
		symbol: currencySymbols.AED,
		name: currencies.UNITED_ARAB_EMIRATES_DIRHAM
	},
	[currency.JPY]: {
		logo: jpyLogo,
		symbol: currencySymbols.JPY,
		name: currencies.JAPANESE_YEN
	},
	[currency.AUD]: {
		logo: audLogo,
		symbol: currencySymbols.AUD,
		name: currencies.AUSTRALIAN_DOLLAR
	},
	[currency.CAD]: {
		logo: cadLogo,
		symbol: currencySymbols.CAD,
		name: currencies.CANADIAN_DOLLAR
	},
	[currency.INR]: {
		logo: inrLogo,
		symbol: currencySymbols.INR,
		name: currencies.INDIAN_RUPEE
	}
};
