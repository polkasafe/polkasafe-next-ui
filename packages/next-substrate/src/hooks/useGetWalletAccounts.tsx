// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import APP_NAME from '@next-common/global/appName';
import { Wallet } from '@next-common/types';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';

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

const useGetWalletAccounts = (chosenWallet?: Wallet) => {
	const { network, api, apiReady } = useGlobalApiContext();

	const [response, setResponse] = useState<Response>(initResponse);

	const getWalletAccounts = async (selectedWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);
		const responseLocal: Response = { ...initResponse };

		const wallet = injectedWindow.injectedWeb3[selectedWallet];

		if (!wallet) {
			responseLocal.noExtension = true;
			setResponse(responseLocal);
			return;
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
			return;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) {
			responseLocal.noAccounts = true;
			setResponse(responseLocal);
			return;
		}
		responseLocal.noAccounts = false;

		responseLocal.accounts = accounts.map((account) => ({
			...account,
			address: getEncodedAddress(account.address, network) || account.address
		}));

		setResponse(responseLocal);
	};

	useEffect(() => {
		getWalletAccounts(chosenWallet || Wallet.POLKADOT);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return response;
};

export default useGetWalletAccounts;
