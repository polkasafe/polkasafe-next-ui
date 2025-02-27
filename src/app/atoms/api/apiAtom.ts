// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { atom } from 'jotai';
import { ApiPromise } from '@polkadot/api';
import { ApiPromise as AvailApiPromise } from 'avail-js-sdk';

export interface AllNetworkApi {
	[network: string]: {
		api: ApiPromise | null | AvailApiPromise;
		apiReady: boolean;
		network: string;
	};
}

export interface IApiAtom {
	api: ApiPromise | null | AvailApiPromise;
	apiReady: boolean;
	network: string;
}

// add all networks api atom
export const polkadotApi = atom<IApiAtom | null>(null);
export const astarApi = atom<IApiAtom | null>(null);
export const availApi = atom<IApiAtom | null>(null);
export const khalaApi = atom<IApiAtom | null>(null);
export const kusamaApi = atom<IApiAtom | null>(null);
export const paseoApi = atom<IApiAtom | null>(null);
export const phalaApi = atom<IApiAtom | null>(null);
export const rococoApi = atom<IApiAtom | null>(null);
export const assethubPolkadotApi = atom<IApiAtom | null>(null);
export const assethubKusamaApi = atom<IApiAtom | null>(null);
export const assethubRococoApi = atom<IApiAtom | null>(null);
export const availTuringApi = atom<IApiAtom | null>(null);
export const westendApi = atom<IApiAtom | null>(null);
export const peopleChainApi = atom<IApiAtom | null>(null);
export const rootApi = atom<IApiAtom | null>(null);
export const porciniApi = atom<IApiAtom | null>(null);
