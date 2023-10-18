// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function formatUSDWithUnits(usd: string, numberAfterDot?: number) {
	const toFixed = numberAfterDot && !Number.isNaN(Number(numberAfterDot)) ? numberAfterDot : 2;
	let newUsd = usd;
	let suffix = '';
	if (typeof usd === 'string') {
		const arr = usd.split(' ');
		if (arr.length > 1) {
			[newUsd] = arr;
			suffix = ` ${arr[1]}`;
		}
	}
	// Nine Zeroes for Billions
	const formattedUSD =
		Math.abs(Number(newUsd)) >= 1.0e9
			? `${(Math.abs(Number(newUsd)) / 1.0e9).toFixed(toFixed)}B`
			: // Six Zeroes for Millions
			Math.abs(Number(newUsd)) >= 1.0e6
			? `${(Math.abs(Number(newUsd)) / 1.0e6).toFixed(toFixed)}M`
			: // Three Zeroes for Thousands
			Math.abs(Number(newUsd)) >= 1.0e3
			? `${(Math.abs(Number(newUsd)) / 1.0e3).toFixed(toFixed)}K`
			: Math.abs(Number(newUsd));

	return formattedUSD.toString() + suffix;
}