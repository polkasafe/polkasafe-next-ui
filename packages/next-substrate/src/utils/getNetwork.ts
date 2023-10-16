// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Network, networks } from '@next-common/global/networkConstants';
/**
 * Return the current network
 *
 */

export default function getNetwork(): Network {
	const defaultNetwork = process.env.REACT_APP_ENV === 'dev' ? 'westend' : 'polkadot';
	let network = (typeof window !== 'undefined' && localStorage.getItem('network')) || defaultNetwork;

	const possibleNetworks = Object.values(networks);

	if (!possibleNetworks.includes(network)) {
		network = defaultNetwork;
	}

	return network;
}
