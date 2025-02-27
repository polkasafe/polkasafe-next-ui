'use client';

import React, { PropsWithChildren } from 'react';
import { Layout as AntDLayout } from 'antd';
import NavHeader from '@common/global-ui-components/Layout/components/NavHeader';
import { IOrganisation } from '@common/types/substrate';
import Footer from './components/Footer';
import Menu from './components/Menu';

const { Sider, Content } = AntDLayout;

const classNames = {
	layoutContainer: 'w-full h-screen',
	sidebarHeaderAndFooter: 'bg-bg-main',
	content: 'bg-bg-secondary p-7 rounded-tl-3xl rounded-bl-3xl max-h-[calc(100vh-64px-64px)] overflow-y-auto'
};

interface ILayoutProps extends PropsWithChildren {
	userAddress: string;
	organisations: Array<IOrganisation>;
	selectedOrganisation: IOrganisation | null;
	logout: () => void;
}

export const Layout = ({ userAddress, organisations, children, selectedOrganisation, logout }: ILayoutProps) => {
	return (
		<AntDLayout className={classNames.layoutContainer}>
			<Sider
				className={classNames.sidebarHeaderAndFooter}
				width={240}
			>
				<Menu
					organisations={organisations}
					userAddress={userAddress}
					organisation={selectedOrganisation}
				/>
			</Sider>
			<AntDLayout className={classNames.sidebarHeaderAndFooter}>
				<NavHeader
					userAddress={userAddress}
					logout={logout}
				/>
				<Content className={classNames.content}>{children}</Content>
				<Footer />
			</AntDLayout>
		</AntDLayout>
	);
};
