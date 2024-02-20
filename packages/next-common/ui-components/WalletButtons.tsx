// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import PolkadotWalletIcon from '@next-common/assets/wallet/polkadotjs-icon.svg';
import SubWalletIcon from '@next-common/assets/wallet/subwallet-icon.svg';
import TalismanIcon from '@next-common/assets/wallet/talisman-icon.svg';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import APP_NAME from '@next-common/global/appName';
import { Wallet } from '@next-common/types';

import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import WalletButton from './WalletButton';

interface IWalletButtons {
	setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
	setWallet?: React.Dispatch<React.SetStateAction<Wallet>>;
	className?: string;
	setNoExtenstion?: React.Dispatch<React.SetStateAction<boolean>>;
	setNoAccounts?: React.Dispatch<React.SetStateAction<boolean>>;
	setFetchAccountsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletButtons: React.FC<IWalletButtons> = ({
	setAccounts,
	setWallet,
	className,
	setNoAccounts,
	setNoExtenstion,
	setFetchAccountsLoading
}: IWalletButtons) => {
	const { loggedInWallet } = useGlobalUserDetailsContext();

	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.POLKADOT);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if (typeof window !== 'undefined') {
			const injectedWindow = window as Window & InjectedWindow;

			const wallet = injectedWindow.injectedWeb3[chosenWallet];

			if (!wallet) {
				setNoExtenstion?.(true);
				return;
			}

			setFetchAccountsLoading?.(true);
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
				setFetchAccountsLoading?.(false);
				console.log(err?.message);
			}
			if (!injected) {
				setFetchAccountsLoading?.(false);
				return;
			}

			const accounts = await injected.accounts.get();

			if (accounts.length === 0) {
				setFetchAccountsLoading?.(false);
				setNoAccounts?.(true);
				return;
			}
			setFetchAccountsLoading?.(false);

			setAccounts(
				accounts.map((account) => ({
					...account,
					address: getSubstrateAddress(account.address) || account.address
				}))
			);
			// if (accounts.length > 0 && api && apiReady) {
			// api.setSigner(injected.signer);
			// }
		}
	};

	useEffect(() => {
		getAccounts(loggedInWallet);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setNoAccounts?.(false);
		setNoExtenstion?.(false);
		event.preventDefault();
		setSelectedWallet(wallet);
		setWallet?.(wallet);
		await getAccounts(wallet);
	};

	return (
		<div className={`mb-2 flex items-center justify-center gap-x-5 ${className}`}>
			<WalletButton
				className={`${
					// eslint-disable-next-line sonarjs/no-duplicate-string
					selectedWallet === Wallet.POLKADOT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
				icon={<PolkadotWalletIcon />}
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.SUBWALLET ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
				icon={<SubWalletIcon />}
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.TALISMAN ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
				icon={<TalismanIcon />}
			/>
		</div>
	);
};

export default WalletButtons;
