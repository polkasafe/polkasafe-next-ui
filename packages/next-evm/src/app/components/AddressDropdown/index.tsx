// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useRef, useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useRouter } from 'next/navigation';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { CircleArrowDownIcon, CopyIcon, WarningRoundedIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { useLogout, useWallets, usePrivy } from '@privy-io/react-auth';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAddress {
	value: string;
	imgSrc: string;
}
const AddressDropdown = () => {
	const { address, loggedInWallet, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const router = useRouter();
	const { logout } = useLogout();
	const { wallets } = useWallets();
	const { connectWallet } = usePrivy();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleDisconnect = async () => {
		logout();
		if (typeof window !== 'undefined') localStorage.clear();
		setUserDetailsContextState((prevState: any) => {
			return {
				...prevState,
				activeMultisig: '',
				address: '',
				addressBook: [],
				isSharedSafe: false,
				multisigAddresses: [],
				sharedSafeAddress: '',
				userID: ''
			};
		});
		toggleVisibility(false);
		router.replace('/login');
	};

	if (!wallets[0]?.address) {
		return (
			<PrimaryButton
				onClick={connectWallet}
				size='large'
			>
				<WarningRoundedIcon className='text-sm text-primary' />
				Connect Wallet
			</PrimaryButton>
		);
	}

	return (
		<div
			className='relative'
			onBlur={() => {
				if (!isMouseEnter.current && isVisible) {
					toggleVisibility(false);
				}
			}}
		>
			<button
				onClick={() => (isVisible ? toggleVisibility(false) : toggleVisibility(true))}
				className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'
			>
				<p className='flex items-center gap-x-2'>
					<span className='bg-primary flex items-center justify-center rounded-full'>
						<MetaMaskAvatar
							address={address}
							size={15}
						/>
					</span>
					<span
						title={address}
						className='hidden md:inline-flex w-20 overflow-hidden truncate'
					>
						{activeOrg?.addressBook?.find((item: any) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
					</span>
				</p>
				<CircleArrowDownIcon className={`hidden md:inline-flex text-sm ${address ? 'text-primary' : 'text-white'}`} />
			</button>

			<div
				className={`absolute scale-90 top-13 left-[-90px] rounded-xl border border-primary bg-bg-main py-[13.5px] px-3 z-40 min-w-[300px] ${
					isVisible ? 'opacity-100 h-auto' : 'opacity-0 h-0 pointer-events-none hidden'
				}`}
				onMouseEnter={() => {
					isMouseEnter.current = true;
				}}
				onMouseLeave={() => {
					isMouseEnter.current = false;
				}}
			>
				<div className='flex items-center justify-center flex-col gap-y-5'>
					<div className='flex items-center justify-center flex-col gap-y-2'>
						<MetaMaskAvatar
							address={address}
							size={50}
						/>
						<p className='text-white font-normal text-sm'>
							{activeOrg?.addressBook?.find((item: any) => item.address === address)?.name}
						</p>
						<p className='bg-bg-secondary mb-1 w-[300px] font-normal gap-x-2 text-sm p-2 rounded-lg flex items-center justify-center'>
							<span className='text-text_secondary'>{shortenAddress(address)}</span>
							<button onClick={() => copyText(address)}>
								<CopyIcon className='text-base text-primary cursor-pointer' />
							</button>
						</p>
					</div>
					<div className='w-full'>
						<p className='border-t border-text_secondary flex items-center text-normal text-sm justify-between w-full p-2'>
							<span className='text-text_secondary'>Wallet</span>
							<span className='text-white capitalize'>{loggedInWallet}</span>
						</p>
					</div>
					<Button
						onClick={handleDisconnect}
						className='rounded-lg outline-none border-none bg-failure bg-opacity-10 w-full flex items-center justify-center font-normal text-sm p-2 text-failure'
					>
						Disconnect
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddressDropdown;
