// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Drawer, Layout, Badge } from 'antd';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import polkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
import LongIframe from '@next-common/assets/long-iframe.svg';
import shortIframe from '@next-common/assets/short-iframe.svg';
import { useActiveMultisigContext } from '@next-evm/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalDAppContext } from '@next-evm/context/DAppContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import useHandleMetamask from '@next-evm/hooks/useHandleMetamask';
import { ISharedAddressBooks } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

import Image from 'next/image';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import dayjs from 'dayjs';
import Footer from './Footer';
import Menu from './Menu';
import NavHeader from './NavHeader';

const { Content, Sider } = Layout;

dayjs.extend(LocalizedFormat);

export interface IRouteInfo {
	pathName: string;
	title: string;
}

const AppLayout = ({ className, children }: { className?: string; children: ReactNode }) => {
	const { activeMultisig, multisigAddresses, isNetworkMismatch } = useGlobalUserDetailsContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const { network } = useGlobalApiContext();
	const { iframeVisibility, setIframeVisibility } = useGlobalDAppContext();
	const [sideDrawer, setSideDrawer] = useState(false);
	const [multisigChanged, setMultisigChanged] = useState(false);
	const [iframeState, setIframeState] = useState(false);
	const [loading, setLoading] = useState(true);
	const pathname = usePathname();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const metamaskError = useHandleMetamask();

	const IframeUrl = `https://sub.id/${activeMultisig}`;
	const isAppsPage = pathname.split('/').pop() === 'apps';
	const hideSlider = iframeState && isAppsPage;

	useEffect(() => {
		setMultisigChanged(true);
		setTimeout(() => {
			setMultisigChanged(false);
		}, 500);
		setLoading(true);
	}, [activeMultisig]);

	const getSharedAddressBook = useCallback(async () => {
		if (
			(typeof window !== 'undefined' && !localStorage.getItem('signature')) ||
			!localStorage.getItem('address') ||
			!multisig
		)
			return;

		setMultisigChanged(true);
		const { data: sharedAddressBookData, error: sharedAddressBookError } =
			await nextApiClientFetch<ISharedAddressBooks>(
				`${EVM_API_URL}/getSharedAddressBookEth`,
				{
					multisigAddress: multisig?.proxy ? multisig.proxy : multisig?.address
				},
				{ network }
			);

		if (!sharedAddressBookError && sharedAddressBookData) {
			setActiveMultisigContextState(sharedAddressBookData as any);
		}
		setMultisigChanged(false);
	}, [multisig, network, setActiveMultisigContextState]);
	useEffect(() => {
		getSharedAddressBook();
	}, [getSharedAddressBook]);

	useEffect(() => {
		if (isAppsPage) setLoading(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const handleIframeLoad = () => {
		setLoading(false);
		// Not abel to grab the elements because of same frame origin
		// const iframe = document.getElementById('Dapp') as HTMLIFrameElement;
		// const iframeDocument = iframe?.contentDocument|| iframe?.contentWindow?.document;
		// const button = iframeDocument?.getElementsByClassName('DfTopBar--rightContent')[0];
		// const search = iframeDocument?.getElementsByClassName('DfSearch')[0];
		// search?.style?.display = 'none';
		// button.style.display ='none';
	};

	return (
		<Layout className={className}>
			<NavHeader
				setSideDrawer={setSideDrawer}
				sideDrawer={sideDrawer}
				showSubmenu={Boolean(iframeVisibility) && isAppsPage}
				onClick={() => {
					setIframeVisibility(null);
					setIframeState(false);
					setLoading(true);
				}}
			/>
			<Layout
				hasSider
				style={{ transition: 'ease-in-out 1s' }}
			>
				<div className={`bg-bg-main ${iframeVisibility && hideSlider ? 'block' : 'hidden'}`}>
					<section className='flex mt-[-45px] ml-8 absolute z-10 justify-start ml-5'>
						<Link
							className='hidden lg:block text-white'
							href='/'
						>
							<Badge
								offset={[-15, 35]}
								size='small'
								count='Beta'
								color='#1573FE'
							>
								<Image
									src={polkasafeLogo}
									alt='polkasafe logo'
									className='h-[25px]'
								/>
							</Badge>
						</Link>
					</section>
					<Image
						src={shortIframe}
						alt=''
						width='30'
						height='30'
						className='hidden lg:block cursor-pointer absolute top-1/2 transform left-4 -translate-y-1/2 z-20'
						onClick={() => setIframeState(false)}
					/>
				</div>
				<>
					<Sider
						trigger={null}
						collapsible={false}
						collapsed
						className={`hidden overflow-y-hidden bg-bg-main sidebar lg:block top-0 bottom-0 left-0 h-screen fixed w-full max-w-[180px] z-10 ${
							!hideSlider ? 'left-0' : 'left-[-300px]'
						}`}
					>
						<Menu />
					</Sider>
					<Drawer
						placement='left'
						closable={false}
						onClose={() => setSideDrawer(false)}
						open={sideDrawer}
						getContainer={false}
						className='w-full max-w-[180px] p-0'
					>
						<Menu />
					</Drawer>
				</>
				<Layout className='min-h flex flex-row p-0 bg-bg-main'>
					<div className={`hidden lg:block w-full max-w-[30px] ${hideSlider ? 'relative' : 'absolute'}`} />
					<div
						className={`hidden lg:block w-full max-w-[180px] ${
							hideSlider ? 'absolute -left-[150px]' : 'relative left-0px'
						}`}
					/>

					{iframeVisibility && isAppsPage ? (
						<div className='w-full rounded-lg'>
							{!!loading && <Loader size='large' />}
							<iframe
								id='Dapp'
								title='Dapp'
								onLoad={handleIframeLoad}
								src={IframeUrl}
								className={`w-full h-[calc(100%)] ${loading ? 'hidden' : 'block'}`}
							/>
							{!hideSlider && (
								<div
									className='hidden lg:block cursor-pointer absolute top-1/2 left-auto -ml-4 transform -translate-y-1/2 z-50'
									onClick={() => setIframeState(true)}
								>
									<LongIframe />
								</div>
							)}
						</div>
					) : (
						<Content className='bg-bg-secondary p-[30px] max-w-[100%] lg:max-w-[calc(100%-180px)] rounded-lg'>
							{multisigChanged || isNetworkMismatch ? <Loader size='large' /> : children}
						</Content>
					)}
				</Layout>
			</Layout>
			<Footer />
		</Layout>
	);
};

export default AppLayout;
