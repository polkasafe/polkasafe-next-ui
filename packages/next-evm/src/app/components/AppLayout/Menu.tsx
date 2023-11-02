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
	HomeIcon,
	NotificationIcon,
	SettingsIcon,
	TransactionIcon,
	UserPlusIcon
} from '@next-common/ui-components/CustomIcons';
import { useAddMultisigContext } from '@next-evm/context/AddMultisigContext';

interface Props {
	className?: string;
}

const Menu: FC<Props> = ({ className }) => {
	const { multisigAddresses, setUserDetailsContextState, activeMultisig, multisigSettings } =
		useGlobalUserDetailsContext();
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

	const menuItems = [
		{
			icon: <HomeIcon />,
			key: '/',
			title: 'Home'
		},
		{
			icon: <AssetsIcon />,
			key: '/assets',
			title: 'Assets'
		},
		{
			icon: <TransactionIcon />,
			key: '/transactions',
			title: 'Transactions'
		},
		{
			icon: <AddressBookIcon />,
			key: '/address-book',
			title: 'Address Book'
		},
		{
			icon: <AppsIcon />,
			key: '/apps',
			title: 'Apps'
		}
	];

	if (userAddress) {
		menuItems.push(
			{
				icon: <NotificationIcon />,
				key: '/notification-settings',
				title: 'Notifications'
			},
			{
				icon: <SettingsIcon />,
				key: '/settings',
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
						href='/'
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
											item.key === pathname && 'bg-highlight text-primary'
										}`}
										href={item.key}
									>
										{item.icon}
										{item.title}
										{item.title === 'Notifications' && (
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
					{multisigAddresses ? multisigAddresses.length : '0'}
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
														activeMultisig: multisig.address
													};
												});
												if (typeof window !== 'undefined') localStorage.setItem('active_multisig', multisig.address);
											}}
										>
											<MetaMaskAvatar
												address={multisig.address}
												size={23}
											/>
											<span className='truncate'>{multisig.name}</span>
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
