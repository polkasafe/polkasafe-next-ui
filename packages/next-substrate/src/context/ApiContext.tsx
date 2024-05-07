/* eslint-disable no-tabs */
/* eslint-disable no-restricted-syntax */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createContext, useContext, useEffect, useMemo, useState, Context, ReactNode, useCallback } from 'react';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import getNetwork from '@next-substrate/utils/getNetwork';
import { initialize } from 'avail-js-sdk';
import checkAvailNetwork from '@next-substrate/utils/checkAvailNetwork';

export interface AllNetworkApi {
	[network: string]: {
		api: any;
		apiReady: boolean;
		network: string;
	};
}

export interface ApiContextType {
	api: ApiPromise | undefined;
	apis: AllNetworkApi;
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

	const [apis, setApis] = useState<AllNetworkApi>();

	useEffect(() => {
		const provider = new WsProvider(chainProperties[network].rpcEndpoint);
		setApiReady(false);
		setApi(new ApiPromise({ provider }));
		if (typeof window !== 'undefined') localStorage.setItem('network', network);
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

	const setApiForAllNetworks = useCallback(async () => {
		for (const n of Object.values(networks)) {
			const isAvail = checkAvailNetwork(n);
			const provider = isAvail ? null : new WsProvider(chainProperties[n].rpcEndpoint);
			// eslint-disable-next-line no-await-in-loop
			const availApi = isAvail && (await initialize(chainProperties[n].rpcEndpoint));
			const a = isAvail ? availApi : new ApiPromise({ provider });
			a.isReady
				.then(() => {
					setApis((prev) => ({
						...prev,
						[n]: {
							api: a,
							apiReady: true,
							network: n
						}
					}));
					console.log(`API ready for network - ${n}`);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, []);

	useEffect(() => {
		setApiForAllNetworks();
	}, [setApiForAllNetworks]);

	// useEffect(() => {
	// 	for (const n of Object.values(networks)) {
	// 		if (apis && apis[n]?.api && !apis[n].apiReady) {
	// 			const a = apis[n].api;
	// 			a.isReady
	// 				.then(() => {
	// 					setApis((prev) => ({
	// 						...prev,
	// 						[n]: {
	// 							...prev[n],
	// 							apiReady: true
	// 						}
	// 					}));
	// 					console.log(`API ready for network - ${n}`);
	// 				})
	// 				.catch((error) => {
	// 					console.error(error);
	// 				});
	// 		}
	// 	}
	// }, [apis]);

	const value = useMemo(() => ({ api, apiReady, apis, network, setNetwork }), [api, apiReady, apis, network]);

	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}
