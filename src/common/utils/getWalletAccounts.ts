// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import APP_NAME from '@common/constants/appName';
import { Wallet } from '@common/enum/substrate';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';

type Response = {
	noExtension: boolean;
	noAccounts: boolean;
	accounts: InjectedAccount[];
};

const initResponse: Response = {
	accounts: [],
	noAccounts: true,
	noExtension: true
};

export const getWalletAccounts = async (chosenWallet?: Wallet) => {
	const injectedWindow = (typeof window !== 'undefined' && window) as Window & InjectedWindow;
	const responseLocal: Response = { ...initResponse };

	const wallet = injectedWindow.injectedWeb3[chosenWallet || Wallet.POLKADOT];

	if (!wallet) {
		responseLocal.noExtension = true;
		return responseLocal;
	}
	responseLocal.noExtension = false;

	let injected: Injected | undefined;

	try {
		injected = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Wallet Timeout'));
			}, 60000); // wait 60 sec
			if (!wallet || !wallet.enable) return;
			wallet
				.enable(APP_NAME)
				.then((value) => {
					clearTimeout(timeoutId);
					resolve(value);
				})
				.catch((error) => {
					reject(error);
				});
		});
	} catch (err) {
		console.log('Error fetching wallet accounts : ', err);
	}

	if (!injected) {
		return responseLocal;
	}

	const accounts = await injected.accounts.get();

	if (accounts.length === 0) {
		responseLocal.noAccounts = true;
		return responseLocal;
	}
	responseLocal.noAccounts = false;

	responseLocal.accounts = accounts.map((account) => ({
		...account,
		address: account.address
	}));

	return responseLocal;
};
