// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { currencyProperties } from '@next-common/global/currencyConstants';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import formatBalance from '@next-evm/utils/formatBalance';

const FiatCurrencyValue = ({ value, className }: { value: string | number; className?: string }) => {
	const { currency, allCurrencyPrices } = useGlobalCurrencyContext();

	const currentCurrency = allCurrencyPrices[currencyProperties[currency].symbol];
	const fiatValue = Number(value || 0) * Number(currentCurrency?.value || 0);
	return (
		<span className={className}>
			{formatBalance(!Number.isNaN(fiatValue) ? fiatValue : 0)} {currentCurrency.code}
		</span>
	);
};

export default FiatCurrencyValue;
