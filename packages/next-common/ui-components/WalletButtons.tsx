// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useCallback, useEffect, useState } from 'react';
import PolkadotWalletIcon from '@next-common/assets/wallet/polkadotjs-icon.svg';
import SubWalletIcon from '@next-common/assets/wallet/subwallet-icon.svg';
import TalismanIcon from '@next-common/assets/wallet/talisman-icon.svg';
import WalletConnectLogo from '@next-common/assets/wallet/wallet-connect-logo.svg';
import polkadotVaultLogo from '@next-common/assets/wallet/polkadot-vault.png';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import APP_NAME from '@next-common/global/appName';
import { Wallet } from '@next-common/types';

import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { useWalletConnectContext } from '@next-substrate/context/WalletConnectProvider';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { QrScanAddress } from '@polkadot/react-qr';
import type { HexString } from '@polkadot/util/types';
import Image from 'next/image';
import { ParachainIcon } from '@next-substrate/app/components/NetworksDropdown/NetworkCard';
import { Dropdown } from 'antd';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { ItemType } from 'antd/es/menu/interface';
import WalletButton from './WalletButton';
import ModalComponent from './ModalComponent';
import InfoBox from './InfoBox';
import { CircleArrowDownIcon } from './CustomIcons';

interface Scanned {
	content: string;
	isAddress: boolean;
	genesisHash: HexString | null;
	name?: string;
}

interface IWalletButtons {
	setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
	setWallet?: React.Dispatch<React.SetStateAction<Wallet>>;
	className?: string;
	setNoExtenstion?: React.Dispatch<React.SetStateAction<boolean>>;
	setNoAccounts?: React.Dispatch<React.SetStateAction<boolean>>;
	setFetchAccountsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
	setVaultNetwork?: React.Dispatch<React.SetStateAction<string>>;
}

const WalletButtons: React.FC<IWalletButtons> = ({
	setAccounts,
	setWallet,
	className,
	setNoAccounts,
	setNoExtenstion,
	setFetchAccountsLoading,
	setVaultNetwork
}: IWalletButtons) => {
	const { loggedInWallet } = useGlobalUserDetailsContext();

	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.POLKADOT);

	const [openVaultModal, setOpenVaultModal] = useState<boolean>(false);

	const [selectedNetwork, setSelectedNetwork] = useState(networks.POLKADOT);

	const networkOptions: ItemType[] = Object.values(networks).map((n) => ({
		key: n,
		label: (
			<span className='text-white flex items-center gap-x-2 capitalize'>
				<ParachainIcon src={chainProperties[n]?.logo} />
				{n}
			</span>
		)
	}));

	const onNetworkChange = (e: any) => {
		setSelectedNetwork(e.key);
		setVaultNetwork?.(e.key);
	};

	const { connect, session } = useWalletConnectContext();
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
		if (wallet === Wallet.WALLET_CONNECT) {
			if (!session) {
				setFetchAccountsLoading?.(true);
				const walletConnectAccounts = await connect();
				setAccounts(
					walletConnectAccounts.map((item) => ({
						address: getSubstrateAddress(item) || item,
						name: DEFAULT_ADDRESS_NAME
					})) || []
				);
				setFetchAccountsLoading?.(false);
			} else {
				const walletConnectAccounts = session.namespaces.polkadot.accounts.map((item) => ({
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

	const onScan = useCallback(
		(scanned: Scanned): void => {
			setAccounts([
				{
					address: scanned.isAddress ? scanned.content : '',
					name: scanned.name || DEFAULT_ADDRESS_NAME
				}
			]);
			setOpenVaultModal(false);
			setFetchAccountsLoading?.(false);
		},
		[setAccounts, setFetchAccountsLoading]
	);

	const onError = useCallback((err: Error): void => {
		console.log('error', err);
	}, []);

	return (
		<div className={`mb-2 flex items-center justify-center gap-x-5 ${className}`}>
			<ModalComponent
				open={openVaultModal}
				onCancel={() => setOpenVaultModal(false)}
				title='Scan your Address QR'
			>
				<>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer mb-2'
						menu={{
							items: networkOptions,
							onClick: onNetworkChange
						}}
					>
						<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
							<span className='flex items-center gap-x-2 capitalize'>
								<ParachainIcon src={chainProperties[selectedNetwork]?.logo} />
								{selectedNetwork}
							</span>
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
					<InfoBox message={`Please Scan your ${selectedNetwork} Address QR in Polkadot Vault`} />
					<QrScanAddress
						isEthereum={false}
						onError={onError}
						onScan={onScan}
					/>
				</>
			</ModalComponent>
			<WalletButton
				className={`${
					// eslint-disable-next-line sonarjs/no-duplicate-string
					selectedWallet === Wallet.POLKADOT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.POLKADOT)}
				icon={<PolkadotWalletIcon />}
				tooltip='Polkadot'
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.SUBWALLET ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.SUBWALLET)}
				icon={<SubWalletIcon />}
				tooltip='Subwallet'
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.TALISMAN ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.TALISMAN)}
				icon={<TalismanIcon />}
				tooltip='Talisman'
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.WALLET_CONNECT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
				// disabled={!apiReady}
				onClick={(event) => handleWalletClick(event as any, Wallet.WALLET_CONNECT)}
				icon={<WalletConnectLogo />}
				tooltip='Wallet Connect'
			/>
			<WalletButton
				className={`${
					selectedWallet === Wallet.POLKADOT_VAULT ? 'border-primary bg-highlight border border-solid' : 'border-none'
				}`}
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
			/>
		</div>
	);
};

export default WalletButtons;
