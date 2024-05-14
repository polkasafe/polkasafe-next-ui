// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import { Badge, Dropdown } from 'antd';
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
	CircleArrowDownIcon,
	ExchangeIcon,
	HomeIcon,
	NotificationIcon,
	SettingsIcon,
	StarIcon,
	TransactionIcon,
	UserPlusIcon,
	TreasuryAnalyticsIcon,
	InvoicesIcon
} from '@next-common/ui-components/CustomIcons';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';
import Image from 'next/image';
import { IMultisigAndNetwork, IOrganisation } from '@next-common/types';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { chainProperties } from '@next-common/global/networkConstants';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

interface Props {
	className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const {
		userID,
		organisations,
		activeMultisig,
		multisigSettings,
		isProxy,
		setUserDetailsContextState,
		isSharedMultisig,
		notOwnerOfMultisig,
		sharedMultisigInfo
	} = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { selectedProxy } = useGlobalUserDetailsContext();
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const [multisigs, setMultisigs] = useState<IMultisigAndNetwork[]>();
	const [selectedMultisigAddress, setSelectedMultisigAddress] = useState('');
	const [selectedNetwork, setSelectedNetwork] = useState('');
	const pathname = usePathname();
	const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');

	const { setOpenAddMultisigModal } = useAddMultisigContext();

	const getPath = (basePath: string) => {
		if (sharedMultisigInfo && isSharedMultisig) {
			return `${basePath}?safe=${activeMultisig}&network=${network}`;
		}
		return basePath;
	};

	useEffect(() => {
		if (!activeOrg) return;
		setMultisigs(
			activeOrg.multisigs.map((item) => ({ address: item.address, name: item.name, network: item.network }))
		);
	}, [activeOrg]);

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
			disabled: notOwnerOfMultisig,
			icon: <AddressBookIcon />,
			key: getPath('/address-book'),
			title: 'Address Book'
		},
		{
			baseURL: '/treasury-analytics',
			disabled: notOwnerOfMultisig,
			icon: <TreasuryAnalyticsIcon />,
			key: getPath('/treasury-analytics'),
			title: 'Treasury Analytics'
		},
		{
			baseURL: '/apps',
			icon: <AppsIcon />,
			key: getPath('/apps'),
			title: 'Apps'
		}
	];

	if (userID) {
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
			},
			{
				baseURL: '/invoices',
				icon: <InvoicesIcon />,
				key: getPath('/invoices'),
				title: 'Invoices'
			}
		);
	}

	const orgOptions: ItemType[] = organisations?.map((item) => ({
		key: JSON.stringify(item),
		label: <span className='text-white truncate capitalize'>{item.name}</span>
	}));

	useEffect(() => {
		const active = activeOrg?.multisigs.find(
			(item) => item.address === selectedMultisigAddress || checkMultisigWithProxy(item.proxy, selectedMultisigAddress)
		);
		if (typeof window !== 'undefined')
			localStorage.setItem('active_multisig', active?.proxy && isProxy ? selectedProxy : selectedMultisigAddress);
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig:
					sharedMultisigInfo && isSharedMultisig
						? sharedMultisigInfo.address
						: active?.proxy && isProxy
						? selectedProxy
						: selectedMultisigAddress
			};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMultisigAddress, isProxy, sharedMultisigInfo, isSharedMultisig, activeOrg?.multisigs, selectedProxy]);

	return (
		<div className={`bg-bg-main flex flex-col h-full py-[25px] px-3 max-sm:px-[0px] max-sm:py-[0px] ${className} `}>
			<div className='flex flex-col mb-3 max-sm:mb-1 overflow-y-hidden'>
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
				{orgOptions && orgOptions.length > 0 && activeOrg && (
					<section className='w-full mb-2'>
						<Dropdown
							trigger={['click']}
							className='p-2 org_dropdown cursor-pointer'
							menu={{
								items: orgOptions,
								onClick: (e) => {
									const org = JSON.parse(e.key) as IOrganisation;
									setActiveOrg(org);
									if (typeof window !== 'undefined') localStorage.setItem('active-org', org.id);
									setUserDetailsContextState((prev) => ({ ...prev, activeMultisig: '' }));
									setSelectedMultisigAddress('');
									setSelectedNetwork('');
								}
							}}
						>
							<div className='flex justify-between items-center text-white gap-x-2'>
								<div className='flex items-center gap-x-3'>
									<Image
										width={30}
										height={30}
										className='rounded-full h-[30px] w-[30px]'
										src={activeOrg?.imageURI || emptyImage}
										alt='empty profile image'
									/>
									{/* <RandomAvatar
										name={orgID}
										size={30}
									/> */}
									<div className='flex flex-col gap-y-[1px]'>
										<span className='text-sm text-white capitalize truncate max-w-[100px]'>{activeOrg?.name}</span>
										<span className='text-xs text-text_secondary'>{activeOrg?.members?.length} Members</span>
									</div>
								</div>
								<CircleArrowDownIcon className='text-white' />
							</div>
						</Dropdown>
					</section>
				)}
				<section className='flex-1 flex flex-col overflow-y-hidden'>
					<h2 className='uppercase text-text_secondary ml-3 text-[10px] font-primary'>Menu</h2>
					<ul className='flex flex-1 flex-col py-2 text-white list-none max-sm:h-[320px] overflow-y-auto'>
						{menuItems.map((item) => {
							return (
								<li
									className='w-full'
									key={item.key}
								>
									<Link
										className={`flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-[13px] ${
											item.baseURL === pathname && 'bg-highlight text-primary'
										} ${item.disabled && 'pointer-events-none cursor-disabled text-text_secondary '} max-sm:p-2`}
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
			<div className='flex flex-col flex-1 max-h-full min-h-[200px] overflow-y-auto'>
				<h2 className='uppercase text-text_secondary ml-3 text-[10px] font-primary flex items-center justify-between'>
					<span>Multisigs</span>
					<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-5 w-5 font-normal text-xs'>
						{multisigs ? multisigs.length : '0'}
					</span>
				</h2>
				<section className='overflow-y-auto max-h-full [&::-webkit-scrollbar]:hidden mb-3'>
					{multisigs && (
						<ul className='flex flex-col gap-y-2 py-3 text-white list-none'>
							{multisigs.map((multisig, i) => {
								return (
									<li
										className='w-full'
										key={`${multisig.address}_${multisig.network}_${activeOrg.id}_${activeOrg.name}_${i}`}
									>
										<button
											className={`w-full flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-[13px] ${
												multisig.address === selectedMultisigAddress &&
												multisig.network === selectedNetwork &&
												'bg-highlight text-primary'
											} max-sm:p-1`}
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
												setSelectedNetwork(multisig.network);
											}}
										>
											<div className='relative'>
												<Identicon
													className='image identicon mx-2'
													value={multisig.address}
													size={23}
													theme='polkadot'
												/>
												<div className='absolute top-[-4px] right-0'>
													<ParachainIcon
														size={10}
														src={chainProperties[multisig.network]?.logo}
													/>
												</div>
											</div>
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
			</div>
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
