// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Badge } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import {
	AddressBookIcon,
	AppsIcon,
	AssetsIcon,
	ExchangeIcon,
	HomeIcon,
	NotificationIcon,
	SettingsIcon,
	StarIcon,
	TransactionIcon,
	UserPlusIcon
} from '@next-common/ui-components/CustomIcons';
import { useAddMultisigContext } from '@next-evm/context/AddMultisigContext';
import { IMultisigAddress } from '@next-common/types';

interface Props {
	className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const {
		multisigAddresses,
		setUserDetailsContextState,
		activeMultisig,
		multisigSettings,
		notOwnerOfSafe,
		isSharedSafe,
		sharedSafeNetwork
	} = useGlobalUserDetailsContext();
	// const router = useRouter();
	const [selectedMultisigAddress, setSelectedMultisigAddress] = useState(activeMultisig || '');
	const pathname = usePathname();
	const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
	const { network } = useGlobalApiContext();
	useEffect(() => {
		if (activeMultisig) {
			setSelectedMultisigAddress(activeMultisig);
		}
	}, [activeMultisig]);

	const { setOpenAddMultisigModal } = useAddMultisigContext();

	const [filteredMultisigs, setFilteredMultisigs] = useState<IMultisigAddress[]>([]);

	const getPath = (basePath: string) => {
		if (activeMultisig && isSharedSafe && sharedSafeNetwork) {
			return `${basePath}?safe=${activeMultisig}&network=${sharedSafeNetwork}`;
		}
		return basePath;
	};

	useEffect(() => {
		const filtered = multisigAddresses.filter(
			(multisig) =>
				multisig.network === network && !multisigSettings?.[`${multisig.address}`]?.deleted && !multisig.disabled
		);
		setFilteredMultisigs(filtered);
	}, [multisigAddresses, multisigSettings, network]);

	const menuItems = [
		{
			baseURL: '/',
			icon: <HomeIcon />,
			key: getPath('/'),
			title: 'Home'
		},
		{
			baseURL: '/exchange',
			disabled: notOwnerOfSafe,
			icon: <ExchangeIcon />,
			key: getPath('/exchange'),
			new: true,
			title: 'Exchange'
		},
		{
			baseURL: '/watchlist',
			icon: <StarIcon />,
			key: getPath('/watchlist'),
			new: true,
			title: 'Watchlist'
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
			disabled: notOwnerOfSafe,
			icon: <AddressBookIcon />,
			key: getPath('/address-book'),
			title: 'Address Book'
		},
		{
			baseURL: '/apps',
			disabled: true,
			icon: <AppsIcon />,
			key: getPath('/apps'),
			title: 'Apps'
		}
	];

	if (userAddress) {
		menuItems.push(
			{
				baseURL: '/notification-settings',
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

	return (
		<div className={classNames(className, 'bg-bg-main flex flex-col h-full py-[25px] px-3')}>
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
										{item.title === 'Apps' && (
											<div className='px-[6px] py-[1px] text-[9px] rounded-lg text-[11px] bg-[#6200E8] text-white'>
												Coming Soon
											</div>
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
					{filteredMultisigs ? filteredMultisigs.length : '0'}
				</span>
			</h2>
			<section className='overflow-y-auto max-h-full [&::-webkit-scrollbar]:hidden flex-1 mb-3'>
				{filteredMultisigs && (
					<ul className='flex flex-col gap-y-2 py-3 text-white list-none'>
						{filteredMultisigs.map((multisig) => {
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
											if (typeof window !== 'undefined') localStorage.setItem('active_multisig', multisig.address);
											setUserDetailsContextState((prevState: any) => {
												return {
													...prevState,
													activeMultisig: multisig.address,
													isSharedSafe: false,
													notOwnerOfSafe: false,
													sharedSafeAddress: '',
													sharedSafeNetwork: network
												};
											});
										}}
									>
										<MetaMaskAvatar
											address={multisig.address}
											size={23}
										/>
										<span className='truncate'>{multisigSettings[multisig.address]?.name || multisig.name}</span>
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
