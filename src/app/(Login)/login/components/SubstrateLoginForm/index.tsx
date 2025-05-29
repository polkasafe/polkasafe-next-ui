// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
 

'use client';

import AccountSelectionForm from '@common/global-ui-components/AccountSelectionForm';
import Button from '@common/global-ui-components/Button';
import { isHex } from '@polkadot/util';
import Loader from '@common/global-ui-components/Loder';
import WalletButtons from '@common/global-ui-components/WalletButtons';
import React, { useEffect, useState } from 'react';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useRouter } from 'next/navigation';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { connectAddress } from '@substrate/app/(Login)/client-actions/connectAddress';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { whitelist } from '@substrate/app/(Login)/login/utils/whiteList';
import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';
import { useAtomValue, useSetAtom } from 'jotai';
import { clientLogin } from '@substrate/app/(Login)/client-actions/client-login';
import { CREATE_ORGANISATION_URL, ORGANISATION_DASHBOARD_URL } from '@substrate/app/global/end-points';
import { userAtom } from '@substrate/app/atoms/auth/authAtoms';
import { ENetwork, NotificationStatus, Wallet, WcPolkadotMethods } from '@common/enum/substrate';
import { walletConnectAtom } from '@substrate/app/atoms/walletConnect/walletConnectAtom';
import { QrState } from '@common/types/substrate';
import { useApi } from '@substrate/app/hooks/useApi';
import Modal from '@common/global-ui-components/Modal';
import InfoBox from '@common/global-ui-components/InfoBox';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { useAuth } from '@futureverse/auth-react';
import { useAuthUi } from '@futureverse/auth-ui';

export function SubstrateLoginForm() {
	const setAtom = useSetAtom(userAtom);

	let qrId = 0;

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [fetchAccountsLoading, setFetchAccountsLoading] = useState<boolean>(false);
	const [signing, setSigning] = useState<boolean>(false);
	const [noAccounts, setNoAccounts] = useState<boolean>(false);
	const [noExtension, setNoExtension] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.SUBWALLET);
	const [tfaToken, setTfaToken] = useState<string>('');

	const apis = useApi();

	const wc = useAtomValue(walletConnectAtom);


	const { openLogin } = useAuthUi();
	const { userSession } = useAuth();
	console.log(userSession);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [tokenExpired, setTokenExpired] = useState<boolean>(false);

	const [openSignWithVaultModal, setOpenSignWithVaultModal] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [vaultTxnHash, setVaultTxnHash] = useState<string>('');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [vaultSignature, setVaultSignature] = useState<string>('');

	const [vaultNetwork, setVaultNetwork] = useState<string>(ENetwork.POLKADOT);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [{ isQrHashed, qrAddress, qrPayload, qrResolve }, setQrState] = useState<QrState>(() => ({
		isQrHashed: false,
		qrAddress: '',
		qrPayload: new Uint8Array()
	}));

	const router = useRouter();

	const onAccountChange = (a: string) => {
		setAddress(a);
	};

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	}, [accounts]);

	const handleConnectWallet = async () => {
		try {
			const address = userSession?.eoa;
			console.log('address', address);
			if(!address) {
				openLogin();
				return;
			}
			const substrateAddress = getSubstrateAddress(address);
			if (!substrateAddress) {
				queueNotification({
					header: 'Failed',
					message: ERROR_MESSAGES.INVALID_SUBSTRATE_ADDRESS,
					status: NotificationStatus.ERROR
				});
				console.log('INVALID SUBSTRATE ADDRESS');
				return;
			}

			setLoading(true);
			const { data: token, error: tokenError } = await connectAddress(substrateAddress);

			if (tokenError) {
				queueNotification({
					header: 'Failed',
					message: ERROR_MESSAGES.UNAUTHORIZED,
					status: NotificationStatus.ERROR
				});
				console.log('ERROR', tokenError);
				setLoading(false);
			} else {
				let signature = '0x';
				if (whitelist.includes(getSubstrateAddress(address))) {
					signature = '0x';
				}
				const { data: userData, error: connectAddressErr } = (await clientLogin(substrateAddress, signature)) as any;

				setLoading(false);
				setSigning(false);

				if (connectAddressErr) {
					setLoading(false);
					setSigning(false);
					queueNotification({
						header: 'Failed',
						message: connectAddressErr,
						status: NotificationStatus.ERROR
					});
				}

				setLoading(false);
				setSigning(false);

				// Update atom state
				setAtom({
					address: substrateAddress,
					signature,
					organisations: []
				});

				localStorage.setItem('logged_in_wallet', selectedWallet);

				queueNotification({
					header: 'Wallet connected successfully!',
					status: NotificationStatus.SUCCESS,
					closeIcon: null
				});

				if (userData.currentOrganisation) {
					router.push(ORGANISATION_DASHBOARD_URL({ id: userData.currentOrganisation }));
					return;
				}
				router.push(CREATE_ORGANISATION_URL);
			}
		} catch (error) {
			console.log('ERROR OCCURED', error);
			setLoading(false);
			setSigning(false);
		}
	};


	useEffect(() => {
		if(userSession) {
			handleConnectWallet();
		}
	}, [userSession]);

	return (
		<>
			<Modal
				open={openSignWithVaultModal}
				onCancel={() => {
					setOpenSignWithVaultModal(false);
					setLoading(false);
				}}
				title='Authorize Transaction in Vault'
			>
				<>
					<InfoBox
						message={`To verify ownership of the address, a transaction will be conducted on the  ${vaultNetwork} network. Please note that a small gas fee will apply.`}
					/>
					<div className='flex items-center gap-x-4'>
						<div className='rounded-xl bg-white p-4'>
							<QrDisplayPayload
								cmd={isQrHashed ? 1 : 2}
								address={address}
								genesisHash={apis[vaultNetwork]?.api?.genesisHash as Uint8Array}
								payload={qrPayload}
							/>
						</div>
						<QrScanSignature
							onScan={(data) => {
								if (data && data.signature && isHex(data.signature)) {
									console.log('signature', data.signature);
									setVaultSignature(data.signature);
									if (qrResolve) {
										qrResolve({
											 
											id: ++qrId,
											signature: data.signature
										});
									}
								}
							}}
						/>
					</div>
				</>
			</Modal>
			<Typography
				variant={ETypographyVariants.h2}
				className='font-bold text-lg text-white'
			>
				Get Started
			</Typography>
			<Typography
				variant={ETypographyVariants.p}
				className='mt-2  text-normal text-sm text-white'
			>
				Connect your wallet
			</Typography>
			<Typography
				variant={ETypographyVariants.p}
				className='text-text_secondary text-sm font-normal mt-5 text-white'
			>
				Your first step towards creating a safe & secure MultiSig
			</Typography>
			{showAccountsDropdown ? (
				<div className='mt-5'>
					<WalletButtons
						wcAtom={walletConnectAtom}
						setNoAccounts={setNoAccounts}
						setFetchAccountsLoading={setFetchAccountsLoading}
						setNoExtenstion={setNoExtension}
						className='mb-4'
						setWallet={setSelectedWallet}
						setAccounts={setAccounts}
						loggedInWallet={selectedWallet}
						setVaultNetwork={setVaultNetwork}
					/>
					{fetchAccountsLoading ? (
						<Loader />
					) : noExtension ? (
						<Typography
							variant={ETypographyVariants.p}
							className='mt-2  text-normal text-sm text-white text-center capitalize'
						>
							Please Install {selectedWallet} Extension.
						</Typography>
					) : noAccounts ? (
						<Typography
							variant={ETypographyVariants.p}
							className='mt-2  text-normal text-sm text-white text-center'
						>
							No Accounts Found. Please Install the Extension And Add Accounts.
						</Typography>
					) : (
						<AccountSelectionForm
							disabled={loading}
							accounts={accounts}
							address={address}
							onAccountChange={onAccountChange}
							title='Choose linked account'
						/>
					)}
				</div>
			) : null}
			{/* <Button
				disabled={(noExtension || noAccounts || !address) && showAccountsDropdown}
				icon={<WalletIcon />}
				loading={loading}
				className='mt-[25px] h-auto'
				onClick={async () => (showAccountsDropdown ? handleConnectWallet() : setShowAccountsDropdown(true))}
			>
				Connect Wallet
			</Button> */}

			<Button onClick={() => openLogin()}>Login with Futureverse</Button>
			{signing && <div className='text-white mt-1'>Please Sign This Randomly Generated Text To Login.</div>}
		</>
	);
}
