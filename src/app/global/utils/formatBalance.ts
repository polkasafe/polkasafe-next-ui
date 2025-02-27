// Copyright 2019-2025 @blobscriptions/marketplace authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { ENetwork } from '@common/enum/substrate';
import { BN } from '@polkadot/util';

interface Options {
	numberAfterComma?: number;
	withUnit?: boolean;
	withThousandDelimitor?: boolean;
}

function scientificToDecimal(scientificStr: string): string {
	const [base, exponent] = scientificStr.toLowerCase().split('e'); // Handle both 'e' and 'E'
	const exp = parseInt(exponent, 10);
	const decimalSplit = base.split('.');

	if (decimalSplit.length === 2) {
		const [intPart, fracPart] = decimalSplit;
		const totalDigits = fracPart.length + exp; // Total number of digits that should be after the decimal

		if (totalDigits <= fracPart.length) {
			// If the total digits required are less than or equal to the fractional part's length,
			// we just insert the decimal point at the correct position.
			return `${intPart + fracPart.slice(0, exp)}.${fracPart.slice(exp)}`;
		}
		// Append sufficient zeros after the fractional part to make up for the exponent
		return intPart + fracPart + '0'.repeat(exp - fracPart.length);
	}
	// If there's no fractional part, just append zeros.
	return base + '0'.repeat(exp);
}

function convertScientificToBigInt(scientificStr: string): string {
	const decimalStr = scientificToDecimal(scientificStr);
	return BigInt(decimalStr).toString();
}

export function formatBalance(
	amount: BN | string,
	options: Options,
	network: ENetwork,
	assetsDecimal?: number
): string {
	let valueString = amount?.toString().split(',').join('') || '0';
	if (valueString.includes('e')) {
		valueString = convertScientificToBigInt(valueString);
	}

	const tokenDecimals = assetsDecimal || networkConstants[network].tokenDecimals;
	const decimals = new BN(tokenDecimals);
	const factor = new BN(10).pow(decimals);
	const amountBN = new BN(valueString);

	const precision = new BN(10).pow(new BN(4));
	const availValue = amountBN.mul(precision).div(factor);

	const { withUnit } = options;
	const unit = withUnit ? ` ${networkConstants[network]?.tokenSymbol}` : '';

	const formattedValue = Number(availValue.toString()) / Number(precision.toString());

	return formattedValue + unit;
}
