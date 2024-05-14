// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import './style.css';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import AddressCard from '@next-substrate/app/components/Home/AddressCard';
import ConnectWallet from '@next-substrate/app/components/Home/ConnectWallet';
import ConnectWalletWrapper from '@next-substrate/app/components/Home/ConnectWallet/ConnectWalletWrapper';
import NewUserModal from '@next-substrate/app/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from '@next-substrate/app/components/Home/DashboardCard';
import EmailBadge from '@next-substrate/app/components/Home/EmailBadge';
import TxnCard from '@next-substrate/app/components/Home/TxnCard';
import AddProxy from '@next-substrate/app/components/Multisig/Proxy/AddProxy';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { CHANNEL, IMultisigAddress, NotificationStatus } from '@next-common/types';
import { OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import hasExistentialDeposit from '@next-substrate/utils/hasExistentialDeposit';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { networks } from '@next-common/global/networkConstants';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import getMultisigProxy from '@next-substrate/utils/getMultisigProxy';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import AddMultisigModal from '../Multisig/AddMultisigModal';
import OrganisationAssets from './OrganisationAssetsCard';
import OrgInfoTable from './OrgInfoTable';
import TopAssetsCard from './TopAssetsCard';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/cognitive-complexity
const Home = ({ className }: { className?: string }) => {
	const {
		address: userAddress,
		notification_preferences,
		activeMultisig,
		isSharedMultisig,
		sharedMultisigInfo,
		setUserDetailsContextState
	} = useGlobalUserDetailsContext();
	const { apis } = useGlobalApiContext();
	const { openProxyModal, setOpenProxyModal } = useAddMultisigContext();
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	const [hasProxy, setHasProxy] = useState<boolean>(true);
	const [proxyInProcess, setProxyInProcess] = useState<boolean>(false);

	const [transactionLoading, setTransactionLoading] = useState(false);
	const [isOnchain, setIsOnchain] = useState(true);
	const [openTransactionModal, setOpenTransactionModal] = useState(false);

	const { activeOrg, setActiveOrg } = useActiveOrgContext();

	const multisigs = activeOrg?.multisigs;
	const multisig = multisigs?.find(
		(item) => item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)
	);
	const [network, setNetwork] = useState<string>(multisig?.network);

	useEffect(() => {
		if (!activeMultisig || !activeOrg?.multisigs) return;
		const m = activeOrg?.multisigs?.find(
			(item) => item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)
		);
		setNetwork(m?.network || networks.POLKADOT);
	}, [activeMultisig, activeOrg?.multisigs]);

	const handleMultisigCreate = async (proxyAddress: string) => {
		try {
			if (!multisig || !multisig.address || !proxyAddress || !network) {
				console.log('ERROR');
				return;
			}
			const createMultisigRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createMultisig_substrate`, {
				body: JSON.stringify({
					signatories: multisig.signatories,
					threshold: multisig.threshold,
					multisigName: multisig.name,
					network,
					proxyAddress
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: multisigData, error: multisigError } = (await createMultisigRes.json()) as {
				data: IMultisigAddress;
				error: string;
			};

			if (multisigError) {
				queueNotification({
					header: 'Error!',
					message: multisigError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			if (multisigData) {
				queueNotification({
					header: 'Success!',
					message: 'Your Proxy has been created Successfully!',
					status: NotificationStatus.SUCCESS
				});
				setActiveOrg((prevState) => {
					const copyMultisigAddresses = [...prevState.multisigs];
					const index = copyMultisigAddresses.findIndex((item) => item.address === multisig.address);
					copyMultisigAddresses[index] = multisigData;
					return {
						...prevState,
						multisigs: copyMultisigAddresses
					};
				});

				setUserDetailsContextState((prevState) => {
					const copyMultisigAddresses = [...prevState.multisigAddresses];
					const index = copyMultisigAddresses.findIndex((item) => item.address === multisig.address);
					copyMultisigAddresses[index] = multisigData;
					return {
						...prevState,
						activeMultisig: getMultisigProxy(multisigData.proxy) || multisigData.address,
						isProxy: true,
						multisigAddresses: copyMultisigAddresses
					};
				});
			}
		} catch (error) {
			console.log('ERROR', error);
		}
	};

	useEffect(() => {
		const fetchProxyData = async () => {
			if (!multisig || !activeMultisig || !network || ['alephzero'].includes(network)) return;
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
			const proxyAddress = getEncodedAddress(params[0]?.value, network);
			if (proxyAddress) {
				console.log('proxy', proxyAddress);
				await handleMultisigCreate(proxyAddress);
			}
		};
		if (multisig?.proxy) {
			setHasProxy(true);
		} else {
			setHasProxy(false);
			fetchProxyData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [multisig, activeMultisig, network]);

	useEffect(() => {
		const handleNewTransaction = async () => {
			if (!apis || !apis[network] || !apis[network].apiReady || !activeMultisig || !network) return;

			setTransactionLoading(true);
			// check if wallet has existential deposit
			const hasExistentialDepositRes = await hasExistentialDeposit(
				apis[network].api,
				multisig?.address || activeMultisig,
				network
			);

			if (!hasExistentialDepositRes) {
				setIsOnchain(false);
			} else {
				setIsOnchain(true);
			}

			setTransactionLoading(false);
		};
		handleNewTransaction();
	}, [activeMultisig, network, multisig, newTxn, apis]);

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

	return userAddress || isSharedMultisig ? (
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
			<AddMultisigModal />
			{(multisigs && multisigs.length > 0 && activeMultisig) || sharedMultisigInfo ? (
				<section>
					{isSharedMultisig ? null : !['alephzero'].includes(network) && !hasProxy && isOnchain && !proxyInProcess ? (
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
				<section className='flex flex-col'>
					<div className='mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto max-sm:grid-cols-9'>
						<div className='col-start-1 col-end-13 lg:col-end-10'>
							<OrganisationAssets
								transactionLoading={transactionLoading}
								setOpenTransactionModal={setOpenTransactionModal}
								openTransactionModal={openTransactionModal}
								setNewTxn={() => {}}
							/>
						</div>
						<div className='col-start-1 col-end-13 lg:col-start-10'>
							<TopAssetsCard />
						</div>
					</div>
					<OrgInfoTable />
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
