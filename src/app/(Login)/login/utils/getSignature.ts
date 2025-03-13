// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import APP_NAME from '@common/constants/appName';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';

export const getSignature = async (selectedWallet: string, token: string, address: string) => {
	const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);
	if (!injectedWindow) {
		return '';
	}
	const wallet = injectedWindow.injectedWeb3[selectedWallet];

	if (!wallet) {
		return '';
	}
	const injected = wallet && wallet.enable && (await wallet.enable(APP_NAME));

	const signRaw = injected && injected.signer && injected.signer.signRaw;
	if (!signRaw) {
		console.error('Signer not available');
		return '';
	}
	const { signature: userSignature } = await signRaw({
		address,
		data: stringToHex(token),
		type: 'bytes'
	});

	return userSignature;
};
