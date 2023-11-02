// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from '@next-common/global/evm-network-constants';

/**
 * Return the current network
 *
 */

export default function getNetwork(): NETWORK {
	const url = typeof window !== 'undefined' && global.window.location.href;
	const subdomain = `${url}`.split('//')[1]?.split('.')[0];
	const defaultNetwork = subdomain === NETWORK.ASTAR ? NETWORK.ASTAR : NETWORK.POLYGON;
	const selectedNetwork = typeof window !== 'undefined' && localStorage.getItem('network');
	const allNetwork =
		subdomain === NETWORK.ASTAR
			? Object.values(NETWORK).filter((item) => item === NETWORK.ASTAR)
			: Object.values(NETWORK).filter((item) => item !== NETWORK.ASTAR);

	if (selectedNetwork && allNetwork.includes(selectedNetwork as NETWORK)) {
		// console.log(selectedNetwork);
		return selectedNetwork as NETWORK;
	}

	if (typeof window !== 'undefined') localStorage.setItem('network', defaultNetwork);

	return defaultNetwork;
}
