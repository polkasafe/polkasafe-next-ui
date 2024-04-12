// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConnectWallet as ThirdConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { Button } from 'antd';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import React, { useCallback, useEffect, useState } from 'react';
import ConnectWalletImg from '@next-common/assets/connect-wallet.svg';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { WalletIcon } from '@next-common/ui-components/CustomIcons';
import { useRouter } from 'next/navigation';

const ConnectWallet = () => {
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const { connectAddress } = useGlobalUserDetailsContext();
	// const sdk = useSDK();
	const { authenticated, logout } = usePrivy();

	useEffect(() => {
		if (authenticated) {
			router.replace('/');
			console.log('login route to home');
		}
	}, [authenticated, router]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleLogin = useCallback(
		async (userID: string, address: string) => {
			try {
				setLoading(true);
				if (!address) {
					setLoading(false);
					return;
				}
				await connectAddress(userID, address, true);
			} catch (err) {
				console.log(err);
				logout();
			}
			setLoading(false);
		},
		[connectAddress, logout]
	);

	const { login } = useLogin({
		onComplete(user) {
			console.log('user', user);
			handleLogin(user?.id, user?.wallet?.address);
		}
	});

	return (
		<div className='flex flex-col items-center justify-center min-h-[400px] h-full'>
			<ConnectWalletImg />
			<h2 className='font-bold text-lg text-white mt-3'>Get Started</h2>
			<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
			<p className='text-text_secondary text-sm font-normal mt-[20px] mb-2'>
				Your first step towards creating a safe & secure MultiSig
			</p>
			{/* {!address ? (
				<ThirdConnectWallet auth={{ loginOptional: false, onLogin: (token) => console.log(token) }} />
			) : ( */}
			<Button
				icon={<WalletIcon />}
				onClick={() => {
					login();
				}}
				loading={loading}
				className='mt-[25px] text-sm border-none outline-none flex items-center justify-center bg-primary text-white'
			>
				Sign In
			</Button>
			{/* )} */}
		</div>
	);
};

export default ConnectWallet;
