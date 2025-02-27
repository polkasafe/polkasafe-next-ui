// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import {
	astarApi,
	polkadotApi,
	availApi,
	khalaApi,
	kusamaApi,
	phalaApi,
	rococoApi,
	assethubPolkadotApi,
	assethubKusamaApi,
	westendApi,
	assethubRococoApi,
	peopleChainApi,
	rootApi,
	porciniApi
} from '@substrate/app/atoms/api/apiAtom';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { initialize } from 'avail-js-sdk';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { ENetwork, NotificationStatus } from '@common/enum/substrate';
import { checkAvailNetwork } from '@substrate/app/global/utils/checkAvailNetwork';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

function InitializeAPI() {
	const setPolkadotApiAtom = useSetAtom(polkadotApi);
	const setPeoplePolkadotApiAtom = useSetAtom(peopleChainApi);
	const setAstarApiAtom = useSetAtom(astarApi);
	const setAvailApiAtom = useSetAtom(availApi);
	const setKhalaApiAtom = useSetAtom(khalaApi);
	const setKusamaApiAtom = useSetAtom(kusamaApi);
	const setPhalaApiAtom = useSetAtom(phalaApi);
	const setRococoApiAtom = useSetAtom(rococoApi);
	const setAssethubPolkadotApiAtom = useSetAtom(assethubPolkadotApi);
	const setAssethubKusamaApiAtom = useSetAtom(assethubKusamaApi);
	const setWestendApiAtom = useSetAtom(westendApi);
	const setAssethubRococoApiAtom = useSetAtom(assethubRococoApi);
	const setRootApiAtom = useSetAtom(rootApi);
	const setPorciniApiAtom = useSetAtom(porciniApi);

	const getApiSetter = (network: string) => {
		switch (network) {
			case ENetwork.POLKADOT:
				return setPolkadotApiAtom;
			case ENetwork.ASTAR:
				return setAstarApiAtom;
			case ENetwork.AVAIL:
				return setAvailApiAtom;
			case ENetwork.KHALA:
				return setKhalaApiAtom;
			case ENetwork.KUSAMA:
				return setKusamaApiAtom;
			case ENetwork.PHALA:
				return setPhalaApiAtom;
			case ENetwork.ROCOCO:
				return setRococoApiAtom;
			case ENetwork.POLKADOT_ASSETHUB:
				return setAssethubPolkadotApiAtom;
			case ENetwork.KUSAMA_ASSETHUB:
				return setAssethubKusamaApiAtom;
			case ENetwork.WESTEND:
				return setWestendApiAtom;
			case ENetwork.ROCOCO_ASSETHUB:
				return setAssethubRococoApiAtom;
			case ENetwork.PEOPLE:
				return setPeoplePolkadotApiAtom;
			case ENetwork.ROOT:
				return setRootApiAtom;
			case ENetwork.PORCINI:
				return setPorciniApiAtom;
			default:
				return null;
		}
	};

	const setAllNetworkApi = async () => {
		try {
			const data = Object.values(networkConstants)
				.filter((network) => !network.disabled)
				.map(async (network) => {
					const isAvail = checkAvailNetwork(network.key);
					const provider = isAvail ? null : new WsProvider(network.rpcEndpoint);
					const availApi = isAvail ? await initialize(network.rpcEndpoint) : null;
					const api = isAvail ? availApi : new ApiPromise({ provider: provider as WsProvider });
					if (!api) {
						queueNotification({
							header: 'Error',
							message: `Failed to connect to ${network} network`,
							status: NotificationStatus.ERROR
						});
						return;
					}
					await api.isReady;
					const setAtom = getApiSetter(network.key);
					if (!setAtom) {
						return;
					}
					console.log(network, 'connected');
					setAtom({
						api,
						apiReady: true,
						network: network.key
					});
				});
			await Promise.all(data);
		} catch (error) {
			console.error(error);
		}
	};

	// const doApiHealthCheck = async () => {
	// 	try {
	// 		const data = Object.values(ENetwork).map(async (network) => {
	// 			const api = getApiValue(network);
	// 			if (!api) {
	// 				return;
	// 			}
	// 			const { api: apiInstance } = api;
	// 			if (!apiInstance) {
	// 				return;
	// 			}
	// 			await apiInstance.isReady;
	// 			await apiInstance.query.system.number();
	// 		});
	// 		await Promise.all(data);
	// 	} catch (error) {
	// 		//do nothing
	// 	}
	// };

	useEffect(() => {
		setAllNetworkApi();
		// const interval = setInterval(() => {
		// 	doApiHealthCheck();
		// }, 6000);
		// return () => {
		// 	clearInterval(interval);
		// };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
}

export default InitializeAPI;
