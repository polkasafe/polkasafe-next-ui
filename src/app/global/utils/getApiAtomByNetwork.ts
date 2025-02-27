// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@common/enum/substrate';
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
	westendApi
} from '@substrate/app/atoms/api/apiAtom';

export const getApiAtomByNetwork = (network: string) => {
	switch (network) {
		case ENetwork.POLKADOT:
			return polkadotApi;
		case ENetwork.ASTAR:
			return astarApi;
		case ENetwork.AVAIL:
			return availApi;
		case ENetwork.KHALA:
			return khalaApi;
		case ENetwork.KUSAMA:
			return kusamaApi;
		case ENetwork.PHALA:
			return phalaApi;
		case ENetwork.ROCOCO:
			return rococoApi;
		case ENetwork.POLKADOT_ASSETHUB:
			return assethubPolkadotApi;
		case ENetwork.KUSAMA_ASSETHUB:
			return assethubKusamaApi;
		case ENetwork.WESTEND:
			return westendApi;
		default:
			return polkadotApi;
	}
};
