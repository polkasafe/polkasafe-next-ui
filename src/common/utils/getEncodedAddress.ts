// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { ENetwork } from '@common/enum/substrate';
import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 * @param network the network
 *
 */
export default function getEncodedAddress(address: string, network: ENetwork | string): string | null {
	const ss58Format = networkConstants[network as ENetwork]?.ss58Format;
	// console.log('ss58Format', ss58Format, network);

	if (!network || ss58Format === undefined || !address) {
		return address;
	}

	if (network === ENetwork.ROOT || network === ENetwork.PORCINI) {
		return address.toLowerCase();
	}

	try {
		return encodeAddress(address, ss58Format).toLowerCase();
	} catch (e) {
		console.error('getEncodedAddress error', e);
		return null;
	}
}
