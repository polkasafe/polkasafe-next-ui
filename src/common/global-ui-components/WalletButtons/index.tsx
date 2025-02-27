// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useCallback, useEffect, useState } from 'react';
import PolkadotWalletIcon from '@common/assets/wallet-icons/polkadotjs-icon.svg';
import SubWalletIcon from '@common/assets/wallet-icons/subwallet-icon.svg';
import TalismanIcon from '@common/assets/wallet-icons/talisman-icon.svg';
import WalletConnectLogo from '@common/assets/wallet-icons/wallet-connect-logo.svg';
import polkadotVaultLogo from '@common/assets/wallet-icons/polkadot-vault.png';
import { twMerge } from 'tailwind-merge';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import WalletButton from '@common/global-ui-components/WalletButton';
import APP_NAME from '@common/constants/appName';
import { Wallet } from '@common/enum/substrate';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { useAtomValue } from 'jotai';
import Image from 'next/image';
import { PolkadotVaultModal } from '@common/modals/PolkadotVault';
import { getEvmAddress } from '@common/utils/getEvmAddresses';

interface IWalletButtons {
	loggedInWallet: Wallet;
	setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
	setWallet?: React.Dispatch<React.SetStateAction<Wallet>>;
	className?: string;
	setNoExtenstion?: React.Dispatch<React.SetStateAction<boolean>>;
	setNoAccounts?: React.Dispatch<React.SetStateAction<boolean>>;
	setFetchAccountsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
	setVaultNetwork?: React.Dispatch<React.SetStateAction<string>>;
	wcAtom?: any;
}

const WalletButtons: React.FC<IWalletButtons> = ({
	loggedInWallet,
	setAccounts,
	setWallet,
	className,
	setNoAccounts,
	setNoExtenstion,
	setFetchAccountsLoading,
	setVaultNetwork,
	wcAtom
}: IWalletButtons) => {
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.SUBWALLET);

	const [openVaultModal, setOpenVaultModal] = useState<boolean>(false);

	const walletConnectValue = useAtomValue(wcAtom) as { connect: any; session: any } | null;
	const connect = walletConnectValue?.connect;
	const session = walletConnectValue?.session;

	const getAccounts = useCallback(
		async (chosenWallet: Wallet): Promise<undefined> => {
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
			}
		},
		[setAccounts, setFetchAccountsLoading, setNoAccounts, setNoExtenstion]
	);

	useEffect(() => {
		const getAddresses = async () => {
			try {
				const wallet = selectedWallet === Wallet.SUBWALLET ? (window as any).SubWallet : (window as any).talismanEth;
				if (!wallet) {
					setNoExtenstion?.(true);
					return;
				}
				setNoExtenstion?.(false);

				const accounts: string[] = await getEvmAddress(wallet);
				if (!accounts) {
					return;
				}
				console.log('accounts', accounts);
				setAccounts(
					accounts.map((account) => ({
						address: account,
						name: DEFAULT_ADDRESS_NAME
					}))
				);
				return accounts;
			} catch (error) {
				console.error('Error fetching EVM address:', error);
			}
		};

		// Example usage
		getAddresses();
		// getAccounts(loggedInWallet);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setNoAccounts?.(false);
		setNoExtenstion?.(false);
		event.preventDefault();
		setSelectedWallet(wallet);
		setWallet?.(wallet);
		if (wallet === Wallet.WALLET_CONNECT) {
			if (!session) {
				setFetchAccountsLoading?.(true);
				const walletConnectAccounts = await connect();
				setAccounts(
					walletConnectAccounts.map((item: any) => ({
						address: getSubstrateAddress(item) || item,
						name: DEFAULT_ADDRESS_NAME
					})) || []
				);
				setFetchAccountsLoading?.(false);
			} else {
				const walletConnectAccounts = session.namespaces.polkadot.accounts.map((item: any) => ({
					address: item.split(':')[2],
					name: DEFAULT_ADDRESS_NAME
				}));
				setAccounts(walletConnectAccounts);
			}
		} else if (wallet === Wallet.POLKADOT_VAULT) {
			setOpenVaultModal(true);
			setFetchAccountsLoading?.(true);
		} else {
			await getAccounts(wallet);
		}
	};

	return (
		<div className={`mb-2 flex items-center justify-center gap-x-5 ${className}`}>
			{/* <PolkadotVaultModal
				openVaultModal={openVaultModal}
				onClose={() => setOpenVaultModal(false)}
				setAccounts={setAccounts}
				setFetchAccountsLoading={setFetchAccountsLoading}
				setVaultNetwork={setVaultNetwork}
			/>
			<WalletButton
				className={twMerge(
					// eslint-disable-next-line sonarjs/no-duplicate-string
					selectedWallet === Wallet.POLKADOT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				onClick={(event: any) => handleWalletClick(event as any, Wallet.POLKADOT)}
				icon={<PolkadotWalletIcon />}
				tooltip='Polkadot'
			/> */}
			<WalletButton
				className={twMerge(
					selectedWallet === Wallet.SUBWALLET ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				onClick={(event: any) => handleWalletClick(event as any, Wallet.SUBWALLET)}
				icon={<SubWalletIcon />}
				tooltip='Subwallet'
			/>
			<WalletButton
				className={twMerge(
					selectedWallet === Wallet.TALISMAN ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				onClick={(event: any) => handleWalletClick(event as any, Wallet.TALISMAN)}
				icon={<TalismanIcon />}
				tooltip='Talisman'
			/>
			<WalletButton
				className={twMerge(
					selectedWallet === Wallet.WALLET_CONNECT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.WALLET_CONNECT)}
				icon={<WalletConnectLogo />}
				tooltip='Wallet Connect'
			/>
			{/* <WalletButton
				className={twMerge(
					selectedWallet === Wallet.POLKADOT_VAULT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT_VAULT)}
				icon={
					<Image
						className='h-[24px] w-[24px]'
						src={polkadotVaultLogo}
						alt='Polkadot Vault'
					/>
				}
				tooltip='Polkadot Vault'
			/> */}
		</div>
	);
};

export default WalletButtons;
