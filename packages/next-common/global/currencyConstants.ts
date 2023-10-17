// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import aedLogo from '~assets/currency-flags/aed.png';
import audLogo from '~assets/currency-flags/aud.png';
import cadLogo from '~assets/currency-flags/cad.png';
import chfLogo from '~assets/currency-flags/chf.png';
import eurLogo from '~assets/currency-flags/eur.png';
import gbpLogo from '~assets/currency-flags/gbp.png';
import inrLogo from '~assets/currency-flags/inr.png';
import jpyLogo from '~assets/currency-flags/jpy.png';
import usdLogo from '~assets/currency-flags/usd.png';

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
