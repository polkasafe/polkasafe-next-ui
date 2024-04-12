// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { EAssetType } from '@next-common/types';
import { IMultisigAssets } from '@next-evm/context/MultisigAssetsContext';

interface Props {
	className?: string;
	address: string;
	network: NETWORK;
	isMultisig?: boolean;
	allAssets?: IMultisigAssets;
}

const Balance = ({ address, className, network = NETWORK.POLYGON, isMultisig, allAssets }: Props) => {
	const { wallets } = useWallets();

	const [balance, setBalance] = useState<string>('0');

	const fetchEthBalance = async (a: string) => {
		try {
			if (!wallets?.[0]) {
				return;
			}
			const provider = await wallets[0]?.getEthersProvider();
			const accountBalance = await provider.getBalance(a);
			if (accountBalance) setBalance(ethers.utils.formatEther(accountBalance));
		} catch (err) {
			console.log('Err from fetchEthBalance', err);
		}
	};

	useEffect(() => {
		if (isMultisig && allAssets) {
			const nativeToken = allAssets[address]?.assets?.find((item) => item.type === EAssetType.NATIVE_TOKEN);
			setBalance(nativeToken.balance_token);
		}
	}, [address, allAssets, isMultisig]);

	useEffect(() => {
		if (address && !isMultisig) fetchEthBalance(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div
			className={`bg-highlight rounded-lg px-[10px] py-[6px] ml-auto font-normal text-xs leading-[13px] flex items-center justify-center ${className}`}
		>
			<span className='text-primary mr-2'>Balance: </span>
			<span className='text-white'>
				{parseFloat(balance)
					.toFixed(2)
					.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
				{chainProperties[network].tokenSymbol}
			</span>
		</div>
	);
};

export default Balance;
