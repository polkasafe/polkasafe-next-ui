// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ConnectWallet as ThirdConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { Button } from 'antd';
import React, { useCallback, useState } from 'react';
import ConnectWalletImg from '@next-common/assets/connect-wallet.svg';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { WalletIcon } from '@next-common/ui-components/CustomIcons';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_AUTH_URL } from '@next-common/global/apiUrls';

const ConnectWallet = () => {
	const { network } = useGlobalApiContext();
	const address = useAddress();
	const [loading, setLoading] = useState<boolean>(false);
	const { connectAddress } = useGlobalUserDetailsContext();
	const sdk = useSDK();

	const handleLogin = useCallback(async () => {
		try {
			setLoading(true);
			if (!address) {
				setLoading(false);
				return;
			}
			// Make a request to the API with the payload.
			const { data: token } = await nextApiClientFetch<string>(`${EVM_API_AUTH_URL}/login`, { address }, { network });
			const signature = (await sdk?.wallet?.sign(token)) || '';
			if (typeof window !== 'undefined') {
				localStorage.setItem('signature', signature);
				localStorage.setItem('address', address);
			}
			console.log(address, signature);
			await connectAddress(network, address, signature);
		} catch (err) {
			console.log(err);
		}
		setLoading(false);
	}, [address, connectAddress, network, sdk?.wallet]);
	return (
		<div className='rounded-xl flex flex-col items-center justify-center min-h-[400px] bg-bg-main'>
			<ConnectWalletImg />
			<h2 className='font-bold text-lg text-white'>Get Started</h2>
			<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
			<p className='text-text_secondary text-sm font-normal mt-[20px] mb-2'>
				Your first step towards creating a safe & secure MultiSig
			</p>
			{!address ? (
				<ThirdConnectWallet auth={{ loginOptional: false, onLogin: (token) => console.log(token) }} />
			) : (
				<Button
					icon={<WalletIcon />}
					onClick={() => {
						handleLogin();
					}}
					loading={loading}
					className='mt-[25px] text-sm border-none outline-none flex items-center justify-center bg-primary text-white'
				>
					Sign In
				</Button>
			)}
		</div>
	);
};

export default ConnectWallet;
