'use client';

import React, { PropsWithChildren } from 'react';
import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
import { App, Divider } from 'antd';
import { Layout as AntDLayout } from 'antd';
import { usePathname, useSearchParams } from 'next/navigation';
import Breadcrumb from '@common/global-ui-components/Breadcrumb';
import DonateButton from '@common/global-ui-components/DonateButton';
import DocsButton from '@common/global-ui-components/DocsButton';
import { Header } from 'antd/es/layout/layout';
import { ScaleMotion } from '@common/global-ui-components/Motion/Scale';
import Link from 'next/link';
import MenuItem from '@common/global-ui-components/Layout/components/MenuItem';
import { watchlistMenuItems } from '@common/global-ui-components/Layout/utils/menuItems';
import Footer from '@common/global-ui-components/Layout/components/Footer';

const { Sider, Content } = AntDLayout;

const classNames = {
	layoutContainer: 'w-full h-screen',
	sidebarHeaderAndFooter: 'bg-bg-main',
	menu: 'text-xs font-normal text-text-secondary uppercase ml-4',
	content: 'bg-bg-secondary p-7 rounded-tl-3xl rounded-bl-3xl max-h-[calc(100vh-64px-64px)] overflow-y-auto'
};

function WatchlistLayout({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const multisig = searchParams.get('_multisig');
	const network = searchParams.get('_network');

	const getUrl = (baseUrl: string, tab?: string) => {
		if (multisig && network) {
			// eslint-disable-next-line sonarjs/no-nested-template-literals
			return `${baseUrl}?_multisig=${multisig}&_network=${network}&${tab ? `&_tab=${tab}` : ''}`;
		}
		return '/';
	};
	return (
		<App>
			<AntDLayout className={classNames.layoutContainer}>
				<Sider
					className={classNames.sidebarHeaderAndFooter}
					width={240}
				>
					<div className='bg-bg-main flex flex-col h-full py-4 px-3 max-sm:px-0 max-sm:py-0 justify-between'>
						<div className='flex flex-col mb-3 max-sm:mb-1 overflow-y-hidden overflow-x-hidden'>
							<ScaleMotion>
								<section className='flex mb-7 justify-center w-full'>
									<Link
										className='text-white'
										href={'/'}
									>
										<PolkasafeLogo />
									</Link>
								</section>
							</ScaleMotion>

							<section className='flex-1 flex flex-col overflow-y-hidden overflow-x-hidden'>
								<h2 className={classNames.menu}>Menu</h2>
								<ul className='flex flex-1 flex-col py-2 text-white list-none max-sm:h-80'>
									{watchlistMenuItems.map((item) => {
										return (
											<MenuItem
												key={item.title}
												baseURL={getUrl(item.baseURL, item.tab)}
												authenticated={true}
												icon={item.icon}
												pathname={pathname}
												title={item.title}
											/>
										);
									})}
								</ul>
							</section>
						</div>
					</div>
				</Sider>
				<AntDLayout className={classNames.sidebarHeaderAndFooter}>
					<Header className='bg-bg-main flex items-center px-0 justify-between pr-3 h-[70px] sticky top-0 left-0 z-50'>
						<div className='p-0 m-0'>
							<Breadcrumb link={pathname} />
						</div>
						<div className='flex items-center gap-x-3'>
							<DonateButton />
							<DocsButton />
						</div>
					</Header>
					<Content className={classNames.content}>{children}</Content>
					<Footer />
				</AntDLayout>
			</AntDLayout>
		</App>
	);
}

export default WatchlistLayout;
