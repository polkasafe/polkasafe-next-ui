// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Button } from 'antd';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { Wallet } from '@next-common/types';
import { CircleArrowDownIcon, CopyIcon, WarningRoundedIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import logout from '@next-substrate/utils/logout';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { useRouter } from 'next/navigation';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import AddressComponent from '@next-common/ui-components/AddressComponent';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAddress {
	value: string;
	imgSrc: string;
}
const AddressDropdown = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { address, loggedInWallet, setUserDetailsContextState, linkedAddresses } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const router = useRouter();

	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleDisconnect = () => {
		logout();
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig: '',
				address: '',
				addressBook: [],
				isSharedMultisig: false,
				loggedInWallet: Wallet.POLKADOT,
				multisigAddresses: [],
				sharedMultisigInfo: undefined,
				userID: ''
			};
		});
		setActiveMultisigContextState((prev) => ({
			...prev,
			multisig: '',
			records: {} as any
		}));
		toggleVisibility(false);
		router.replace('/login');
	};

	if (!address) {
		return (
			<Link
				href='/login'
				onClick={() =>
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							activeMultisig: '',
							address: '',
							addressBook: [],
							isSharedMultisig: false,
							loggedInWallet: Wallet.POLKADOT,
							multisigAddresses: [],
							sharedMultisigInfo: undefined
						};
					})
				}
				className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'
			>
				<WarningRoundedIcon className='text-sm text-primary' />
				Not Connected
			</Link>
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
						<Identicon
							size={15}
							value={address}
							theme='polkadot'
						/>
					</span>
					<span
						title={address}
						className='hidden md:inline-flex w-20 overflow-hidden truncate'
					>
						{activeOrg?.addressBook?.find((item) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
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
						<Identicon
							className='border-2 rounded-full bg-transparent border-primary p-1'
							value={address}
							size={50}
							theme='polkadot'
						/>
						<p className='text-white font-normal text-sm'>
							{activeOrg?.addressBook?.find((item) => item.address === address)?.name}
						</p>
						<p className='bg-bg-secondary mb-1 w-[300px] font-normal gap-x-2 text-sm p-2 rounded-lg flex items-center justify-center'>
							<span className='text-text_secondary'>{shortenAddress(getSubstrateAddress(address) || address)}</span>
							<button onClick={() => copyText(getSubstrateAddress(address) || address)}>
								<CopyIcon className='text-base text-primary cursor-pointer' />
							</button>
						</p>
					</div>
					<div className='w-full'>
						<p className='border-t border-b border-text_secondary flex items-center text-normal text-sm justify-between w-full p-2'>
							<span className='text-text_secondary'>Wallet</span>
							<span className='text-white capitalize'>{loggedInWallet}</span>
						</p>
						{linkedAddresses && linkedAddresses.length > 0 ? (
							<>
								<p className='text-text_secondary text-sm w-full p-2 flex items-center gap-x-2'>
									Linked Addresses <Badge status='success' />
								</p>
								<div className='flex flex-col gap-y-1 p-2 max-h-[150px] overflow-y-auto'>
									{linkedAddresses.map((a) => (
										<AddressComponent address={a} />
									))}
								</div>
							</>
						) : null}
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
