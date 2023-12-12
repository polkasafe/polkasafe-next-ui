// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
// import AddMultisig from '@next-substrate/app/components/Multisig/AddMultisig';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import {
	AddressBookIcon,
	AppsIcon,
	AssetsIcon,
	ExchangeIcon,
	HomeIcon,
	NotificationIcon,
	SettingsIcon,
	TransactionIcon,
	UserPlusIcon
} from '@next-common/ui-components/CustomIcons';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';

interface Props {
	className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const {
		multisigAddresses,
		activeMultisig,
		multisigSettings,
		isProxy,
		setUserDetailsContextState,
		isSharedMultisig,
		notOwnerOfMultisig,
		sharedMultisigInfo
	} = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [selectedMultisigAddress, setSelectedMultisigAddress] = useState(
		(typeof window !== 'undefined' && localStorage.getItem('active_multisig')) || ''
	);
	const pathname = usePathname();
	const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');

	const { setOpenAddMultisigModal } = useAddMultisigContext();

	const getPath = (basePath: string) => {
		if (sharedMultisigInfo && isSharedMultisig) {
			return `${basePath}?safe=${activeMultisig}&network=${network}`;
		}
		return basePath;
	};

	const menuItems = [
		{
			baseURL: '/',
			icon: <HomeIcon />,
			key: getPath('/'),
			title: 'Home'
		},
		{
			baseURL: '/exchange',
			disabled: notOwnerOfMultisig,
			icon: <ExchangeIcon />,
			key: getPath('/exchange'),
			new: true,
			title: 'Exchange'
		},
		{
			baseURL: '/assets',
			icon: <AssetsIcon />,
			key: getPath('/assets'),
			title: 'Assets'
		},
		{
			baseURL: '/transactions',
			icon: <TransactionIcon />,
			key: getPath('/transactions'),
			title: 'Transactions'
		},
		{
			baseURL: '/address-book',
			disabled: notOwnerOfMultisig,
			icon: <AddressBookIcon />,
			key: getPath('/address-book'),
			title: 'Address Book'
		},
		{
			baseURL: '/apps',
			icon: <AppsIcon />,
			key: getPath('/apps'),
			title: 'Apps'
		}
	];

	if (userAddress) {
		menuItems.push(
			{
				baseURL: '/notifications-settings',
				icon: <NotificationIcon />,
				key: getPath('/notification-settings'),
				title: 'Notifications'
			},
			{
				baseURL: '/settings',
				icon: <SettingsIcon />,
				key: getPath('/settings'),
				title: 'Settings'
			}
		);
	}

	useEffect(() => {
		const filteredMutisigs =
			multisigAddresses?.filter(
				(multisig) =>
					multisig.network === network &&
					!multisigSettings?.[`${multisig.address}_${multisig.network}`]?.deleted &&
					!multisig.disabled
			) || [];
		const multi = filteredMutisigs?.find(
			(multisig) => multisig.address === activeMultisig || multisig.proxy === activeMultisig
		);
		if (multi) {
			if (!multi.proxy) {
				setUserDetailsContextState((prev) => ({ ...prev, isProxy: false }));
			} else {
				setUserDetailsContextState((prev) => ({ ...prev, isProxy: true }));
			}
			setSelectedMultisigAddress(multi.address);
		} else if (filteredMutisigs.length) setSelectedMultisigAddress(filteredMutisigs[0].address);
		else setSelectedMultisigAddress('');

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisigAddresses, network]);

	useEffect(() => {
		const active = multisigAddresses.find(
			(item) => item.address === selectedMultisigAddress || item.proxy === selectedMultisigAddress
		);
		if (typeof window !== 'undefined')
			localStorage.setItem('active_multisig', active?.proxy && isProxy ? active.proxy : selectedMultisigAddress);
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig:
					sharedMultisigInfo && isSharedMultisig
						? sharedMultisigInfo.address
						: active?.proxy && isProxy
						? active.proxy
						: selectedMultisigAddress
			};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisigAddresses, selectedMultisigAddress, isProxy, sharedMultisigInfo, isSharedMultisig]);

	return (
		<div className={`bg-bg-main flex flex-col h-full py-[25px] px-3 ${className}`}>
			<div className='flex flex-col mb-3'>
				<section className='flex mb-7 justify-center w-full'>
					<Link
						className='text-white'
						href={getPath('/')}
					>
						<Badge
							offset={[-15, 35]}
							size='small'
							count='Beta'
							color='#1573FE'
						>
							<div className=''>
								<PolkasafeLogo />
							</div>
						</Badge>
					</Link>
				</section>
				<section>
					<h2 className='uppercase text-text_secondary ml-3 text-[10px] font-primary'>Menu</h2>
					<ul className='flex flex-col py-2 text-white list-none'>
						{menuItems.map((item) => {
							return (
								<li
									className='w-full'
									key={item.key}
								>
									<Link
										className={`flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-[13px] ${
											item.baseURL === pathname && 'bg-highlight text-primary'
										} ${item.disabled && 'pointer-events-none cursor-disabled text-text_secondary '} `}
										href={item.key}
									>
										{item.icon}
										{item.title}
										{item.new && (
											<div className='px-[6px] py-[1px] text-[10px] rounded-lg text-xs bg-primary text-white'>New</div>
										)}
									</Link>
								</li>
							);
						})}
					</ul>
				</section>
			</div>
			<h2 className='uppercase text-text_secondary ml-3 text-[10px] font-primary flex items-center justify-between'>
				<span>Multisigs</span>
				<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-5 w-5 font-normal text-xs'>
					{multisigAddresses
						? multisigAddresses.filter(
								(multisig) =>
									multisig.network === network && !multisigSettings?.[multisig.address]?.deleted && !multisig.disabled
						  ).length
						: '0'}
				</span>
			</h2>
			<section className='overflow-y-auto max-h-full [&::-webkit-scrollbar]:hidden flex-1 mb-3'>
				{multisigAddresses && (
					<ul className='flex flex-col gap-y-2 py-3 text-white list-none'>
						{multisigAddresses
							.filter(
								(multisig) =>
									multisig.network === network &&
									!multisigSettings?.[`${multisig.address}_${multisig.network}`]?.deleted &&
									!multisig.disabled
							)
							.map((multisig) => {
								return (
									<li
										className='w-full'
										key={multisig.address}
									>
										<button
											className={`w-full flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-[13px] ${
												multisig.address === selectedMultisigAddress && 'bg-highlight text-primary'
											}`}
											onClick={() => {
												setUserDetailsContextState((prevState: any) => {
													return {
														...prevState,
														activeMultisig: multisig.address,
														isSharedSafe: false,
														notOwnerOfSafe: false,
														sharedMultisigAddress: '',
														sharedMultisigInfo: undefined
													};
												});
												setSelectedMultisigAddress(multisig.address);
											}}
										>
											<Identicon
												className='image identicon mx-2'
												value={multisig.address}
												size={23}
												theme='polkadot'
											/>
											<span className='truncate'>
												{multisigSettings?.[`${multisig.address}_${multisig.network}`]?.name || multisig.name}
											</span>
										</button>
									</li>
								);
							})}
					</ul>
				)}
			</section>
			{userAddress && (
				<section className='mt-auto'>
					<button
						className='text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-2 cursor-pointer'
						onClick={() => setOpenAddMultisigModal(true)}
					>
						<UserPlusIcon className='text-sm' />
						<span className='font-medium text-xs'>Add Multisig</span>
					</button>
				</section>
			)}
		</div>
	);
};

export default Menu;
