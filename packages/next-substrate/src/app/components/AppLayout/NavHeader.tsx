// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MenuOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import React, { FC } from 'react';
import { usePathname } from 'next/navigation';
import DonateBtn from '@next-common/components/Donate/DonateBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DocsIcon } from '@next-common/ui-components/CustomIcons';
import AddressDropdown from '@next-substrate/app/components/AddressDropdown';
// import NetworksDropdown from '@next-substrate/app/components/NetworksDropdown';
import Notification from '@next-substrate/app/components/Notification';

const { Header } = Layout;

interface Props {
	sideDrawer: boolean;
	setSideDrawer: React.Dispatch<React.SetStateAction<boolean>>;
	showSubmenu?: boolean;
	onClick?: VoidFunction;
}

const NavHeader: FC<Props> = ({ sideDrawer, setSideDrawer, showSubmenu, onClick }) => {
	const pathname = usePathname();
	const { address } = useGlobalUserDetailsContext();
	return (
		<Header className='bg-bg-main z-10 flex flex-row items-center sticky top-0 left-0 p-0 h-[70px]'>
			<section className='hidden lg:block w-[200px]' />
			<section className='pr-4 lg:pr-8 pl-0 flex-1 flex items-center gap-x-2'>
				<article className='lg:hidden ml-4'>
					<button
						className='flex items-center justify-center outline-none border-none bg-bg-secondary text-primary rounded-lg px-[18px] py-[8px] font-bold text-xl'
						onClick={() => {
							setSideDrawer(!sideDrawer);
						}}
					>
						<MenuOutlined />
					</button>
				</article>
				<article className='hidden lg:block ml-4'>
					<p className='bg-bg-secondary text-primary rounded-xl px-[16px] py-[6px] font-bold text-xl capitalize'>
						{showSubmenu && onClick ? (
							<>
								<button
									onClick={onClick}
									className='hover:underline cursor-pointer'
								>
									{pathname === '/' ? 'Home' : pathname.slice(1).split('-').join(' ')}
								</button>{' '}
								/ SubId
							</>
						) : pathname === '/' ? (
							'Home'
						) : (
							pathname.slice(1).split('-').join(' ')
						)}
					</p>
				</article>
				<article className='ml-auto flex items-center gap-x-3'>
					{address && <Notification />}
					{/* <NetworksDropdown /> */}
					<AddressDropdown />
					<DonateBtn />
					<a
						href='https://docs.polkasafe.xyz/'
						target='_blank'
						rel='noreferrer'
						className='flex items-center justify-center gap-x-2 outline-none border-none text-waiting bg-waiting bg-opacity-10 rounded-lg p-2.5 shadow-none text-xs'
					>
						<DocsIcon /> Docs
					</a>
				</article>
			</section>
		</Header>
	);
};

export default NavHeader;
