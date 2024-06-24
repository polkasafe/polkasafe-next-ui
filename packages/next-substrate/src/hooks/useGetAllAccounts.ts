// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Signer } from '@polkadot/api/types';
import { isWeb3Injected, web3Enable } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';
import { ApiContext, useGlobalApiContext } from '@next-substrate/context/ApiContext';
import APP_NAME, { WALLET_NAME } from '@next-common/global/appName';
import { Wallet } from '@next-common/types';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';

type Response = {
	noExtension: boolean;
	noAccounts: boolean;
	signersMap: { [key: string]: Signer };
	accounts: InjectedAccount[];
	accountsMap: { [key: string]: string };
};

const initResponse: Response = {
	accounts: [],
	accountsMap: {},
	noAccounts: true,
	noExtension: true,
	signersMap: {}
};

const useGetAllAccounts = () => {
	const { network, api, apiReady } = useGlobalApiContext();

	const [response, setResponse] = useState<Response>(initResponse);

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

		if (!wallet) {
			return undefined;
		}

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
			return undefined;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) return undefined;

		return accounts.map((account) => ({
			...account,
			address: getEncodedAddress(account.address, network) || account.address
		}));
	};

	const getAccounts = async (): Promise<undefined> => {
		if (!api || !apiReady) {
			return;
		}

		const extensions = await web3Enable(APP_NAME);

		const responseLocal: Response = { ...initResponse };

		if (extensions.length === 0) {
			responseLocal.noExtension = true;
			setResponse(responseLocal);
			return;
		}
		responseLocal.noExtension = false;

		let accounts: InjectedAccount[] = [];
		let polakadotJSAccounts: InjectedAccount[] | undefined;
		// let subwalletAccounts: InjectedAccount[] | undefined;
		// let talismanAccounts: InjectedAccount[] | undefined;

		const signersMapLocal = response.signersMap as { [key: string]: Signer };
		const accountsMapLocal = response.accountsMap as { [key: string]: string };

		await Promise.all(
			extensions.map(async (extObj) => {
				if (extObj.name === WALLET_NAME) {
					signersMapLocal['polkadot-js'] = extObj.signer;
					polakadotJSAccounts = await getWalletAccounts(Wallet.POLKADOT);
				}
				// else if(extObj.name == 'subwallet-js') {
				// signersMapLocal['subwallet-js'] = extObj.signer;
				// subwalletAccounts = await getWalletAccounts(Wallet.SUBWALLET);
				// } else if(extObj.name == 'talisman') {
				// signersMapLocal['talisman'] = extObj.signer;
				// talismanAccounts = await getWalletAccounts(Wallet.TALISMAN);
				// }
			})
		);

		if (polakadotJSAccounts) {
			accounts = accounts.concat(polakadotJSAccounts);
			polakadotJSAccounts.forEach((acc: InjectedAccount) => {
				accountsMapLocal[acc.address] = 'polkadot-js';
			});
		}

		// if(subwalletAccounts) {
		// accounts = accounts.concat(subwalletAccounts);
		// subwalletAccounts.forEach((acc: InjectedAccount) => {
		// accountsMapLocal[acc.address] = 'subwallet-js';
		// });
		// }

		// if(talismanAccounts) {
		// accounts = accounts.concat(talismanAccounts);
		// talismanAccounts.forEach((acc: InjectedAccount) => {
		// accountsMapLocal[acc.address] = 'talisman';
		// });
		// }

		if (accounts.length === 0) {
			responseLocal.noAccounts = true;
			setResponse(responseLocal);
			return;
		}
		responseLocal.noAccounts = false;
		responseLocal.accountsMap = accountsMapLocal;
		responseLocal.signersMap = signersMapLocal;

		responseLocal.accounts = accounts;

		setResponse(responseLocal);

		if (accounts.length > 0) {
			const signer: Signer = signersMapLocal[accountsMapLocal[accounts[0].address]];
			api.setSigner(signer);
		}
	};

	useEffect(() => {
		getAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return response;
};

export default useGetAllAccounts;
