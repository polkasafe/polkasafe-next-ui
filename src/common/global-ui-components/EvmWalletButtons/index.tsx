// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import SubWalletIcon from '@common/assets/wallet-icons/subwallet-icon.svg';
import { twMerge } from 'tailwind-merge';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import WalletButton from '@common/global-ui-components/WalletButton';
import { Wallet } from '@common/enum/substrate';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';
import { useAtomValue } from 'jotai';
import { getEvmAddress } from '@common/utils/getEvmAddresses';
import TalismanIcon from '@common/assets/wallet-icons/talisman-icon.svg';

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

	useEffect(() => {
		getAddresses();
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
			await getAddresses();
		}
	};

	return (
		<div className={`mb-2 flex items-center justify-center gap-x-5 ${className}`}>
			<WalletButton
				className={twMerge(
					selectedWallet === Wallet.SUBWALLET ? 'border-primary bg-highlight border border-solid' : 'border-none'
				)}
				onClick={(event: any) => handleWalletClick(event as any, Wallet.SUBWALLET)}
				icon={<SubWalletIcon />}
				tooltip='Subwallet'
			/>
		</div>
	);
};

export default WalletButtons;
