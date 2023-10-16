// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Currency, currencies } from '@next-common/global/currencyConstants';
/**
 * Return the current network
 *
 */

export default function getCurrency(): Currency {
	const defaultCurrency = currencies.UNITED_STATES_DOLLAR;
	let currency = (typeof window !== 'undefined' && localStorage.getItem('currency')) || defaultCurrency;

	const possibleCurrencies = Object.values(currencies);

	if (!possibleCurrencies.includes(currency)) {
		currency = defaultCurrency;
	}

	return currency;
}
