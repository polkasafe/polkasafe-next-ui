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
	assethubRococoApi,
	availTuringApi,
	westendApi,
	peopleChainApi,
	rootApi,
	porciniApi
} from '@substrate/app/atoms/api/apiAtom';
import { useAtomValue } from 'jotai';

export const useAllAPI = () => {
	const polkadot = useAtomValue(polkadotApi);
	const astar = useAtomValue(astarApi);
	const avail = useAtomValue(availApi);
	const khala = useAtomValue(khalaApi);
	const kusama = useAtomValue(kusamaApi);
	const phala = useAtomValue(phalaApi);
	const rococo = useAtomValue(rococoApi);
	const assethubPolkadot = useAtomValue(assethubPolkadotApi);
	const assethubKusama = useAtomValue(assethubKusamaApi);
	const assethubRococo = useAtomValue(assethubRococoApi);
	// const availTuring = useAtomValue(availTuringApi);
	const westend = useAtomValue(westendApi);
	const people = useAtomValue(peopleChainApi);
	const root = useAtomValue(rootApi);
	const porcini = useAtomValue(porciniApi);

	const getApi = (network: ENetwork) => {
		switch (network) {
			case ENetwork.POLKADOT:
				return polkadot;
			case ENetwork.ASTAR:
				return astar;
			case ENetwork.AVAIL:
				return avail;
			case ENetwork.KHALA:
				return khala;
			case ENetwork.KUSAMA:
				return kusama;
			case ENetwork.PHALA:
				return phala;
			case ENetwork.ROCOCO:
				return rococo;
			case ENetwork.POLKADOT_ASSETHUB:
				return assethubPolkadot;
			case ENetwork.KUSAMA_ASSETHUB:
				return assethubKusama;
			case ENetwork.ROCOCO_ASSETHUB:
				return assethubRococo;
			// case ENetwork.AVAIL:
			// 	return availTuring;
			case ENetwork.WESTEND:
				return westend;
			case ENetwork.PEOPLE:
				return people;
			case ENetwork.ROOT:
				return root;
			case ENetwork.PORCINI:
				return porcini;
			default:
				return null;
		}
	};

	return {
		allApi: {
			[ENetwork.POLKADOT]: polkadot,
			[ENetwork.ASTAR]: astar,
			[ENetwork.AVAIL]: avail,
			[ENetwork.KHALA]: khala,
			[ENetwork.KUSAMA]: kusama,
			[ENetwork.PHALA]: phala,
			[ENetwork.ROCOCO]: rococo,
			[ENetwork.POLKADOT_ASSETHUB]: assethubPolkadot,
			[ENetwork.KUSAMA_ASSETHUB]: assethubKusama,
			[ENetwork.ROCOCO_ASSETHUB]: assethubRococo,
			[ENetwork.WESTEND]: westend,
			[ENetwork.PEOPLE]: people,
			[ENetwork.ROOT]: root,
			[ENetwork.PORCINI]: porcini
		},
		getApi
	};
};
