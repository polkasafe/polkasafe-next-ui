// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { chainProperties } from '@next-common/global/evm-network-constants';
import getNetwork from '@next-evm/utils/getNetwork';

const useHandleMetamask = (): string => {
	const network = getNetwork();
	const networkChainID = chainProperties[network]?.chainId;

	const [metaMaskNetworkChainID, setMetaMaskNetworkChainID] = useState<string>('');
	const [metaMaskError, setMetaMaskError] = useState<string>('');

	useEffect(() => {
		setMetaMaskError('');

		console.log('mat');

		// Check for changes in Metamask (account and chain)
		const ethereum = (window as any)?.ethereum;
		if (!ethereum?.isMetaMask) {
			setMetaMaskError('Please install the MetaMask extension to use supported features.');
		} else if (ethereum && typeof window !== 'undefined') {
			ethereum.on('chainChanged', () => {
				window.location.reload();
			});

			ethereum.on('accountsChanged', () => {
				window.location.reload();
			});

			setMetaMaskNetworkChainID(ethereum.networkVersion);
		}
	}, [metaMaskNetworkChainID, networkChainID, network]);

	return metaMaskError;
};

export default useHandleMetamask;
