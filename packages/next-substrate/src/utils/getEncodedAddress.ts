// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';
import { chainProperties } from '@next-common/global/networkConstants';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 * @param network the network
 *
 */
export default function getEncodedAddress(address: string, network: string): string | null {
	const ss58Format = chainProperties?.[network]?.ss58Format;

	if (!network || ss58Format === undefined) {
		return null;
	}

	try {
		return encodeAddress(address, ss58Format);
	} catch (e) {
		console.error('getEncodedAddress error', e);
		return null;
	}
}
