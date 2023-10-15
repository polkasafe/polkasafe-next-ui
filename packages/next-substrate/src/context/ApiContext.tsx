// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createContext, useContext, useEffect, useMemo, useState, Context, ReactNode } from 'react';
import { chainProperties } from '@next-common/global/networkConstants';
import getNetwork from '@next-substrate/utils/getNetwork';

export interface ApiContextType {
	api: ApiPromise | undefined;
	apiReady: boolean;
	network: string;
	setNetwork: React.Dispatch<React.SetStateAction<string>>;
}

export const ApiContext: Context<ApiContextType> = createContext({} as ApiContextType);

export interface ApiContextProviderProps {
	children?: ReactNode;
}

export function ApiContextProvider({ children }: ApiContextProviderProps): ReactNode {
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [network, setNetwork] = useState(getNetwork());

	useEffect(() => {
		const provider = new WsProvider(chainProperties[network].rpcEndpoint);
		setApiReady(false);
		setApi(new ApiPromise({ provider }));
	}, [network]);

	useEffect(() => {
		if (api) {
			api.isReady
				.then(() => {
					setApiReady(true);
					console.log('API ready');
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [api]);

	const value = useMemo(() => ({ api, apiReady, network, setNetwork }), [api, apiReady, network]);

	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}
