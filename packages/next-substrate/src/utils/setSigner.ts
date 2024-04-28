// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import APP_NAME from '@next-common/global/appName';
import { Wallet } from '@next-common/types';
import { isNumber } from '@polkadot/util';
import { signedExtensions, types } from 'avail-js-sdk';
import checkAvailNetwork from './checkAvailNetwork';

const getInjectorMetadata = (api: any) => {
	return {
		chain: api.runtimeChain.toString(),
		chainType: 'substrate' as const,
		genesisHash: api.genesisHash.toHex(),
		icon: 'substrate',
		specVersion: api.runtimeVersion.specVersion.toNumber(),
		ss58Format: isNumber(api.registry.chainSS58) ? api.registry.chainSS58 : 0,
		tokenDecimals: api.registry.chainDecimals[0] || 18,
		tokenSymbol: api.registry.chainTokens[0] || 'AVAIL',
		types: types as any,
		userExtensions: signedExtensions
	};
};

export default async function setSigner(api: any, chosenWallet: Wallet, network?: string) {
	const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);

	const wallet = injectedWindow.injectedWeb3[chosenWallet];

	if (!wallet) {
		return;
	}

	let injected: Injected | undefined;
	try {
		injected = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Wallet Timeout'));
			}, 60000); // wait 60 sec

			if (wallet && wallet.enable) {
				wallet
					.enable(APP_NAME)
					.then((value) => {
						clearTimeout(timeoutId);
						resolve(value);
					})
					.catch((error) => {
						reject(error);
					});
			}
		});
	} catch (err) {
		console.log(err?.message);
	}
	if (!injected) {
		return;
	}
	if (checkAvailNetwork(network)) {
		const metadata = getInjectorMetadata(api);
		await injected.metadata.provide(metadata);
		const inj = injected;
		if (inj?.signer) {
			api.setSigner(inj.signer);
			return;
		}
	}
	api.setSigner(injected.signer);
}
