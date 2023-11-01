// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ReactNode, useContext, useMemo, useState, createContext } from 'react';
import { NETWORK } from '@next-common/global/evm-network-constants';
import getNetwork from '@next-evm/utils/getNetwork';

export interface ApiContextType {
	network: NETWORK;
	setNetwork: React.Dispatch<React.SetStateAction<NETWORK>>;
}

export const ApiContext: React.Context<ApiContextType> = createContext({} as ApiContextType);

export interface ApiContextProviderProps {
	children?: ReactNode;
}

export function ApiContextProvider({ children }: ApiContextProviderProps): ReactNode {
	const [network, setNetwork] = useState<NETWORK>(getNetwork());

	const value = useMemo(() => ({ network, setNetwork }), [network]);

	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}
