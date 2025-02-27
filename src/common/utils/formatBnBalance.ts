// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { ENetwork } from '@common/enum/substrate';
import * as BN from 'bn.js';

interface Options {
	numberAfterComma?: number;
	withUnit?: boolean;
	withThousandDelimitor?: boolean;
}

export default function formatBnBalance(value: BN | string, options: Options, network: ENetwork): string {
	const tokenDecimals = networkConstants[network]?.tokenDecimals;
	const valueString = value.toString();

	let suffix = '';
	let prefix = '';

	if (valueString.length > tokenDecimals) {
		suffix = valueString.slice(-tokenDecimals);
		prefix = valueString.slice(0, valueString.length - tokenDecimals);
	} else {
		prefix = '0';
		suffix = valueString.padStart(tokenDecimals, '0');
	}

	let comma = '.';
	const { numberAfterComma, withThousandDelimitor = true, withUnit } = options;
	const numberAfterCommaLtZero = numberAfterComma && numberAfterComma < 0;

	if (numberAfterCommaLtZero || numberAfterComma === 0 || suffix === '') {
		comma = '';
		suffix = '';
	} else if (numberAfterComma && numberAfterComma > 0) {
		suffix = suffix.slice(0, numberAfterComma);
	}

	if (withThousandDelimitor) {
		prefix = prefix.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	const unit = withUnit ? ` ${networkConstants[network]?.tokenSymbol}` : '';

	return `${prefix}${comma}${suffix}${unit}`;
}
