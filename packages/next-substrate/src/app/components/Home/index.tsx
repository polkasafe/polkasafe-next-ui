// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import './style.css';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import AddressCard from '@next-substrate/app/components/Home/AddressCard';
import ConnectWallet from '@next-substrate/app/components/Home/ConnectWallet';
import ConnectWalletWrapper from '@next-substrate/app/components/Home/ConnectWallet/ConnectWalletWrapper';
import NewUserModal from '@next-substrate/app/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from '@next-substrate/app/components/Home/DashboardCard';
import EmailBadge from '@next-substrate/app/components/Home/EmailBadge';
import TxnCard from '@next-substrate/app/components/Home/TxnCard';
import AddMultisig from '@next-substrate/app/components/Multisig/AddMultisig';
import AddProxy from '@next-substrate/app/components/Multisig/Proxy/AddProxy';
import Loader from '@next-substrate/app/components/UserFlow/Loader';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { CHANNEL, NotificationStatus } from '@next-common/types';
import { OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import hasExistentialDeposit from '@next-substrate/utils/hasExistentialDeposit';
import ModalComponent from '@next-common/ui-components/ModalComponent';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/cognitive-complexity
const Home = ({ className }: { className?: string }) => {
	const {
		address: userAddress,
		notification_preferences,
		multisigAddresses,
		multisigSettings,
		createdAt,
		addressBook,
		activeMultisig
	} = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	const [openProxyModal, setOpenProxyModal] = useState(false);
	const [hasProxy, setHasProxy] = useState<boolean>(true);
	const [proxyNotInDb, setProxyNotInDb] = useState<boolean>(false);
	const [proxyInProcess, setProxyInProcess] = useState<boolean>(false);

	const [transactionLoading, setTransactionLoading] = useState(false);
	const [isOnchain, setIsOnchain] = useState(true);
	const [openTransactionModal, setOpenTransactionModal] = useState(false);

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	useEffect(() => {
		if (dayjs(createdAt) > dayjs().subtract(15, 'seconds') && addressBook?.length === 1) {
			setOpenNewUserModal(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);

	useEffect(() => {
		const fetchProxyData = async () => {
			if (!multisig || ['alephzero'].includes(network)) return;
			const response = await fetch(`https://${network}.api.subscan.io/api/scan/events`, {
				body: JSON.stringify({
					row: 1,
					page: 0,
					module: 'proxy',
					call: 'PureCreated',
					address: multisig.address
				}),
				headers: SUBSCAN_API_HEADERS,
				method: 'POST'
			});

			const responseJSON = await response.json();
			if (responseJSON.data?.count === 0) {
				return;
			}
			const params = JSON.parse(responseJSON.data?.events[0]?.params);
			const proxyAddress = getEncodedAddress(params[0].value, network);
			if (proxyAddress) {
				setProxyNotInDb(true);
			}
		};
		if (multisig?.proxy) {
			setHasProxy(true);
		} else {
			setHasProxy(false);
			fetchProxyData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisig, network]);

	useEffect(() => {
		const handleNewTransaction = async () => {
			if (!api || !apiReady || !activeMultisig) return;

			setTransactionLoading(true);
			// check if wallet has existential deposit
			const hasExistentialDepositRes = await hasExistentialDeposit(api, multisig?.address || activeMultisig, network);

			if (!hasExistentialDepositRes) {
				setIsOnchain(false);
			} else {
				setIsOnchain(true);
			}

			setTransactionLoading(false);
		};
		handleNewTransaction();
	}, [activeMultisig, api, apiReady, network, multisig, newTxn]);

	useEffect(() => {
		if (!isOnchain && userAddress && activeMultisig) {
			queueNotification({
				className: 'scale-[100%] rounded-md bg-bg-secondary border-2 border-solid border-primary text-white',
				closeIcon: (
					<div className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</div>
				),
				header: <span className='text-waiting'>No Existential Deposit</span>,
				message: (
					<div className='text-white'>
						<p>Please Add Existential Deposit to your Multisig to make it Onchain.</p>
						<div className='flex justify-end w-full'>
							<Button
								onClick={() => {
									setOpenTransactionModal(true);
									notification.destroy();
								}}
								size='small'
								className='text-xs text-white bg-primary border-none outline-none'
							>
								Add Existential Deposit
							</Button>
						</div>
					</div>
				),
				placement: 'bottomRight',
				status: NotificationStatus.WARNING
			});
		}
	}, [activeMultisig, isOnchain, userAddress]);

	return userAddress ? (
		<>
			<NewUserModal
				open={openNewUserModal}
				onCancel={() => setOpenNewUserModal(false)}
			/>
			<ModalComponent
				onCancel={() => setOpenProxyModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Proxy</h3>}
				open={openProxyModal}
			>
				<AddProxy
					setProxyInProcess={setProxyInProcess}
					homepage
					onCancel={() => setOpenProxyModal(false)}
				/>
			</ModalComponent>
			{multisigAddresses &&
			multisigAddresses.filter(
				(m) => m.network === network && !multisigSettings?.[`${m.address}_${m.network}`]?.deleted && !m.disabled
			).length > 0 ? (
				<section>
					{!['alephzero'].includes(network) && !hasProxy && !proxyNotInDb && isOnchain && !proxyInProcess ? (
						<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left border-2 border-solid border-waiting text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>Create a proxy to edit or backup your Multisig.</p>
							<Button
								onClick={() => setOpenProxyModal(true)}
								size='small'
								className='border-none outline-none text-waiting bg-transparent flex items-center'
								icon={<PlusCircleOutlined />}
							>
								Create Proxy
							</Button>
						</section>
					) : !isOnchain ? (
						<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left border-2 border-solid border-waiting text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>Please Add Existential Deposit to make Multisig Onchain.</p>
							<Button
								onClick={() => setOpenTransactionModal(true)}
								size='small'
								className='border-none outline-none text-waiting bg-transparent'
							>
								Add Existential Deposit
							</Button>
						</section>
					) : proxyNotInDb ? (
						<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>Your Proxy has been Created.</p>
							<Button
								onClick={() => {
									if (typeof window !== 'undefined') window.location.reload();
								}}
								size='small'
								className='border-none outline-none text-waiting bg-transparent'
							>
								Refresh
							</Button>
						</section>
					) : proxyInProcess && !hasProxy ? (
						<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>Your Proxy is Awaiting Approvals from other Signatories.</p>
						</section>
					) : null}
					{!notification_preferences?.channelPreferences?.[CHANNEL.EMAIL]?.verified && <EmailBadge />}
					<div className='mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto'>
						<div className='col-start-1 col-end-13 lg:col-end-8'>
							<DashboardCard
								transactionLoading={transactionLoading}
								isOnchain={isOnchain}
								setOpenTransactionModal={setOpenTransactionModal}
								openTransactionModal={openTransactionModal}
								hasProxy={hasProxy}
								setNewTxn={setNewTxn}
							/>
						</div>
						<div className='col-start-1 col-end-13 lg:col-start-8 h-full'>
							<AddressCard />
						</div>
					</div>
					<div className='grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1'>
						<div className='col-start-1 col-end-13 lg:col-end-13'>
							<TxnCard
								setProxyInProcess={setProxyInProcess}
								newTxn={newTxn}
							/>
						</div>
					</div>
				</section>
			) : (
				<section className='bg-bg-main p-5 rounded-lg scale-90 w-[111%] h-[111%] origin-top-left'>
					<section className='grid grid-cols-2 gap-x-5'>
						<Loader className='bg-primary col-span-1' />
						<Loader className='bg-primary col-span-1' />
					</section>
					<AddMultisig
						className='mt-4'
						homepage
					/>
				</section>
			)}
		</>
	) : (
		<ConnectWalletWrapper>
			<ConnectWallet />
		</ConnectWalletWrapper>
	);
};

export default Home;
