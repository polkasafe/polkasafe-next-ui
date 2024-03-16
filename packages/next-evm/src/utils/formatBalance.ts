// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function formatBalance(amount: number | string) {
	return Number.isNaN(Number(amount))
		? '0.00'
		: Number(amount)
				.toFixed(2)
				.replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
