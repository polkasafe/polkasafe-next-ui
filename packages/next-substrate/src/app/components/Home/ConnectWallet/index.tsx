// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ArrowLeftOutlined } from '@ant-design/icons';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Button, Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import ConnectWalletImg from '@next-common/assets/connect-wallet.svg';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { initialUserDetailsContext, useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import APP_NAME from '@next-common/global/appName';
import { IUser, NotificationStatus, Triggers, Wallet } from '@next-common/types';
import AccountSelectionForm from '@next-common/ui-components/AccountSelectionForm';
import { WalletIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import queueNotification from '@next-common/ui-components/QueueNotification';
import WalletButtons from '@next-common/ui-components/WalletButtons';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
// import Image from 'next/image';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import getConnectAddressToken from '@next-substrate/utils/getConnectAddressToken';
import { SUBSTRATE_API_AUTH_URL } from '@next-common/global/apiUrls';

const whitelist = [
	getSubstrateAddress('16Ge612BDMd2GHKWFPhkmJizF7zgYEmtD1xPpnLwFT2WxS1'),
	getSubstrateAddress('1tCjdvnVKEoEKwPnHjiWverQPZw7fwrHJ9beizBYWC3nTwm'),
	getSubstrateAddress('15s78GDxmAhxNdt6pxaxGcPrzboaMem5k3jP3xXyZvVVfLLr'),
	getSubstrateAddress('15kAhLvVhtQuWyMDvts3pPAbz3maLbz7CSdwcbg5UQ96GATt'),
	getSubstrateAddress('15Sf9AnqDooBgdV91hixPHY99SJom9DMzLKbxg6dYRsqTa4a'),
	getSubstrateAddress('5Gq84otocj45uGWqB4cacNnVeyCCFeKHg6EtK76BLvh2sM1s')
];

// eslint-disable-next-line sonarjs/cognitive-complexity
const ConnectWallet = () => {
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [signing, setSigning] = useState<boolean>(false);
	const [noAccounts, setNoAccounts] = useState<boolean>(false);
	const [noExtension, setNoExtension] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.POLKADOT);
	const [tfaToken, setTfaToken] = useState<string>('');
	const [authCode, setAuthCode] = useState<number>();
	const [tokenExpired, setTokenExpired] = useState<boolean>(false);

	const onAccountChange = (a: string) => {
		setAddress(a);
	};

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	}, [accounts, network]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleConnectWallet = async () => {
		try {
			const substrateAddress = getSubstrateAddress(address);

			// TODO - error state
			if (!substrateAddress) {
				console.log('INVALID SUBSTRATE ADDRESS');
				return;
			}

			setLoading(true);

			const tokenResponse = await getConnectAddressToken(substrateAddress);

			const { data: token, error: tokenError } = tokenResponse as { data: any; error: string };

			if (tokenError) {
				// TODO extension
				console.log('ERROR', tokenError);
				setLoading(false);
			} else if (typeof token !== 'string' && token?.tfa_token && token?.tfa_token?.token) {
				setTfaToken(token.tfa_token.token);
				setLoading(false);
			} else {
				let signature = '';
				if (whitelist.includes(getSubstrateAddress(address)) === false) {
					const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);

					const wallet = injectedWindow.injectedWeb3[selectedWallet];

					if (!wallet) {
						setLoading(false);
						return;
					}
					const injected = wallet && wallet.enable && (await wallet.enable(APP_NAME));

					const signRaw = injected && injected.signer && injected.signer.signRaw;
					if (!signRaw) console.error('Signer not available');
					setSigning(true);
					const { signature: userSign } = await signRaw({
						address: substrateAddress,
						data: stringToHex(token),
						type: 'bytes'
					});
					signature = userSign;

					setSigning(false);
				}

				const connectAddressRes = await nextApiClientFetch(
					'api/v1/substrate/auth/connectAddress',
					{},
					{ address: substrateAddress, signature }
				);

				const { data: userData, error: connectAddressErr } = connectAddressRes as {
					data: IUser;
					error: string;
				};

				if (connectAddressErr) {
					setLoading(false);
					setSigning(false);
					queueNotification({
						header: 'Failed',
						message: connectAddressErr,
						status: NotificationStatus.ERROR
					});
				}

				if (!connectAddressErr && userData) {
					setLoading(false);
					setSigning(false);

					if (typeof window !== 'undefined') {
						localStorage.setItem('signature', signature);
						localStorage.setItem('address', substrateAddress);
						localStorage.setItem('logged_in_wallet', selectedWallet);
					}

					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							address: userData?.address,
							addressBook: userData?.addressBook || [],
							createdAt: userData?.created_at,
							loggedInWallet: selectedWallet,
							multisigAddresses: userData?.multisigAddresses,
							multisigSettings: userData?.multisigSettings || {},
							notification_preferences: userData?.notification_preferences || {
								channelPreferences: {},
								triggerPreferences: {
									[Triggers.INIT_MULTISIG_TRANSFER]: {
										enabled: true,
										name: Triggers.INIT_MULTISIG_TRANSFER
									},
									[Triggers.EXECUTED_TRANSACTION]: {
										enabled: true,
										name: Triggers.EXECUTED_TRANSACTION
									},
									[Triggers.SCHEDULED_APPROVAL_REMINDER]: {
										enabled: true,
										hoursToRemindIn: 2,
										name: Triggers.SCHEDULED_APPROVAL_REMINDER
									}
								}
							},
							tfa_token: userData?.tfa_token,
							transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields,
							two_factor_auth: userData?.two_factor_auth,
							watchlists: userData?.watchlists
						};
					});
				}
			}
		} catch (error) {
			console.log('ERROR OCCURED', error);
			setLoading(false);
			setSigning(false);
		}
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleSubmitAuthCode = async () => {
		const substrateAddress = getSubstrateAddress(address);

		// TODO - error state
		if (!substrateAddress) {
			console.log('INVALID SUBSTRATE ADDRESS');
			return;
		}

		if (!tfaToken) return;

		setLoading(true);
		try {
			const { data: token, error: validate2FAError } = await nextApiClientFetch<string>(
				`${SUBSTRATE_API_AUTH_URL}/2fa/validate2FA`,
				{
					authCode,
					tfa_token: tfaToken
				},
				{ address: substrateAddress }
			);

			if (validate2FAError) {
				if (validate2FAError === '2FA token expired.') {
					setTokenExpired(true);
				}
				queueNotification({
					header: 'Failed',
					message: validate2FAError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
			}

			if (!validate2FAError && token) {
				const injectedWindow = typeof window !== 'undefined' && (window as Window & InjectedWindow);

				const wallet = injectedWindow.injectedWeb3[selectedWallet];

				if (!wallet) {
					setLoading(false);
					return;
				}
				const injected = wallet && wallet.enable && (await wallet.enable(APP_NAME));

				const signRaw = injected && injected.signer && injected.signer.signRaw;
				if (!signRaw) console.error('Signer not available');
				setSigning(true);
				setTfaToken('');
				const { signature } = await signRaw({
					address: substrateAddress,
					data: stringToHex(token),
					type: 'bytes'
				});

				setSigning(false);

				const { data: userData, error: connectAddressErr } = await nextApiClientFetch<IUser>(
					`${SUBSTRATE_API_AUTH_URL}/connectAddress`,
					{},
					{ address: substrateAddress, network, signature }
				);

				if (!connectAddressErr && userData) {
					setLoading(false);
					setSigning(false);

					if (typeof window !== 'undefined') {
						localStorage.setItem('signature', signature);
						localStorage.setItem('address', substrateAddress);
						localStorage.setItem('logged_in_wallet', selectedWallet);
					}

					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							address: userData?.address,
							addressBook: userData?.addressBook || [],
							createdAt: userData?.created_at,
							loggedInWallet: selectedWallet,
							multisigAddresses: userData?.multisigAddresses,
							multisigSettings: userData?.multisigSettings || {},
							notification_preferences: userData?.notification_preferences || {
								channelPreferences: {},
								triggerPreferences: {
									[Triggers.INIT_MULTISIG_TRANSFER]: {
										enabled: true,
										name: Triggers.INIT_MULTISIG_TRANSFER
									},
									[Triggers.EXECUTED_TRANSACTION]: {
										enabled: true,
										name: Triggers.EXECUTED_TRANSACTION
									},
									[Triggers.SCHEDULED_APPROVAL_REMINDER]: {
										enabled: true,
										hoursToRemindIn: 2,
										name: Triggers.SCHEDULED_APPROVAL_REMINDER
									}
								}
							},
							tfa_token: userData?.tfa_token,
							transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields,
							two_factor_auth: userData?.two_factor_auth,
							watchlists: userData?.watchlists
						};
					});
				}
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
			setSigning(false);
			queueNotification({
				header: 'Failed',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<div className='rounded-xl flex flex-col items-center justify-center min-h-[400px] bg-bg-main'>
			{/* <Image
				src={ConnectWalletImg}
				alt='Wallet'
				height={120}
				width={120}
				className='mb-4 mt-1'
			/> */}
			<div className='mb-4 mt-1'>
				<ConnectWalletImg />
			</div>
			{!api || !apiReady ? (
				<Loader
					size='large'
					text='Loading Accounts...'
				/>
			) : tfaToken ? (
				<>
					<h2 className='text-lg text-white font-semibold'>Two Factor Authentication</h2>
					<p className='text-sm text-white'>
						Please open the two-step verification app or extension and input the authentication code for your
						Polkassembly account.
					</p>

					<div className='mt-5'>
						<label
							htmlFor='authCode'
							className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'
						>
							Auth Code
						</label>
						<Form.Item
							name='authcode'
							rules={[
								{
									message: 'Required',
									required: true
								}
							]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder='######'
								className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
								id='authCode'
								onChange={(e) => setAuthCode(Number(e.target.value))}
								value={authCode}
								disabled={loading}
								maxLength={6}
							/>
						</Form.Item>
						<Button
							disabled={!authCode || Number.isNaN(authCode)}
							icon={<WalletIcon />}
							loading={loading}
							onClick={handleSubmitAuthCode}
							className={`mt-[25px] text-sm border-none outline-none flex items-center justify-center ${
								(noExtension || noAccounts || !address) && showAccountsDropdown
									? 'bg-highlight text-text_secondary'
									: 'bg-primary text-white'
							} max-w-[320px] w-full`}
						>
							Login
						</Button>
					</div>
					{tokenExpired && (
						<section className='mt-4 text-xs w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2 max-w-[380px]'>
							<WarningCircleIcon />
							<p>Request session expired, please go back and login again.</p>
						</section>
					)}
					<Button
						icon={<ArrowLeftOutlined />}
						disabled={loading}
						onClick={() => {
							setTfaToken('');
							setTokenExpired(false);
						}}
						className='mt-[25px] text-sm border-none outline-none flex items-center justify-center text-primary p-0'
					>
						Go Back
					</Button>
				</>
			) : (
				<>
					<h2 className='font-bold text-lg text-white'>Get Started</h2>
					<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
					<p className='text-text_secondary text-sm font-normal mt-[20px]'>
						Your first step towards creating a safe & secure MultiSig
					</p>
					{showAccountsDropdown ? (
						<div className='mt-[20px]'>
							<WalletButtons
								setNoAccounts={setNoAccounts}
								setNoExtenstion={setNoExtension}
								className='mb-4'
								setWallet={setSelectedWallet}
								setAccounts={setAccounts}
							/>
							{noExtension ? (
								<p className='mt-[10px]  text-normal text-sm text-white text-center capitalize'>
									Please Install {selectedWallet} Extension.
								</p>
							) : noAccounts ? (
								<p className='mt-[10px]  text-normal text-sm text-white text-center'>
									No Accounts Found. Please Install the Extension And Add Accounts.
								</p>
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
					<Button
						disabled={(noExtension || noAccounts || !address) && showAccountsDropdown}
						icon={<WalletIcon />}
						loading={loading}
						onClick={async () => (showAccountsDropdown ? handleConnectWallet() : setShowAccountsDropdown(true))}
						className={`mt-[25px] text-sm border-none outline-none flex items-center justify-center ${
							(noExtension || noAccounts || !address) && showAccountsDropdown
								? 'bg-highlight text-text_secondary'
								: 'bg-primary text-white'
						} max-w-[320px] w-full`}
					>
						Connect Wallet
					</Button>
					{signing && <div className='text-white mt-1'>Please Sign This Randomly Generated Text To Login.</div>}
				</>
			)}
		</div>
	);
};

export default ConnectWallet;
