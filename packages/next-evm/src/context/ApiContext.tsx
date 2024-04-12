// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import {
	Arbitrum,
	Astar,
	Binance,
	Ethereum,
	Gnosis,
	Goerli,
	Optimism,
	Polygon,
	ZetachainAthens3Testnet
} from '@thirdweb-dev/chains';
// import { metamaskWallet, ThirdwebProvider, walletConnect } from '@thirdweb-dev/react';
import React, { useContext, useMemo, useState } from 'react';
import { NETWORK } from '@next-common/global/evm-network-constants';
import getNetwork from '@next-evm/utils/getNetwork';
// import { EVM_API_AUTH_URL } from '@next-common/global/apiUrls';

export interface ApiContextType {
	network: NETWORK;
	setNetwork: React.Dispatch<React.SetStateAction<NETWORK>>;
}

export const ApiContext: React.Context<ApiContextType> = React.createContext({} as ApiContextType);

export interface ApiContextProviderProps {
	children?: React.ReactElement;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chains: any = {
	arbitrum: Arbitrum,
	astar: Astar,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'bnb smart chain': Binance,
	ethereum: Ethereum,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'gnosis chain': Gnosis,
	goerli: Goerli,
	optimism: Optimism,
	polygon: Polygon,
	[NETWORK.ZETA_CHAIN]: ZetachainAthens3Testnet
};

export function ApiContextProvider({ children }: ApiContextProviderProps): React.ReactElement {
	const [network, setNetwork] = useState<NETWORK>(getNetwork());

	const value = useMemo(() => ({ network, setNetwork }), [network]);

	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}
