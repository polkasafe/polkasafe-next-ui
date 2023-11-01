// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from '@next-common/global/evm-network-constants';

/**
 * Return the current network
 *
 */

export default function getNetwork(): NETWORK {
	const defaultNetwork = NETWORK.ASTAR;

	const url = typeof window !== 'undefined' && window.location.href;

	let network = (`${url}`.split('//')[1]?.split('.')[0] as NETWORK) || defaultNetwork;

	const possibleNetworks = Object.values(network);

	if (!possibleNetworks.includes(network)) {
		network = defaultNetwork;
	}

	if (typeof window !== 'undefined') localStorage.setItem('network', network);

	return network;
}
