// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import './style.css';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import AddressCard from '@next-evm/app/components/Home/AddressCard';
import NewUserModal from '@next-evm/app/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from '@next-evm/app/components/Home/DashboardCard';
import TxnCard from '@next-evm/app/components/Home/TxnCard';
import AddMultisig from '@next-evm/app/components/Multisig/AddMultisig';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import Spinner from '@next-common/ui-components/Loader';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import OrganisationAssets from './OrganisationAssetsCard';
import OrgInfoTable from './OrgInfoTable';
import TopAssetsCard from './TopAssetsCard';

const Home = () => {
	const { activeMultisig, loading, createdAt, addressBook } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const [transactionLoading] = useState(false);
	const [openTransactionModal, setOpenTransactionModal] = useState(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);

	const multisigs = activeOrg?.multisigs;

	useEffect(() => {
		if (dayjs(createdAt) > dayjs().subtract(15, 'seconds') && addressBook?.length === 1) {
			setOpenNewUserModal(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);

	return (
		<>
			<NewUserModal
				open={openNewUserModal}
				onCancel={() => setOpenNewUserModal(false)}
			/>
			{loading ? (
				<Spinner size='large' />
			) : multisigs && multisigs.length > 0 ? (
				activeMultisig ? (
					<section>
						<div className='mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto'>
							<div className='col-start-1 col-end-13 lg:col-end-8'>
								<DashboardCard
									transactionLoading={transactionLoading}
									setOpenTransactionModal={setOpenTransactionModal}
									openTransactionModal={openTransactionModal}
									setNewTxn={() => {}}
								/>
							</div>
							<div className='col-start-1 col-end-13 lg:col-start-8 h-full'>
								<AddressCard />
							</div>
						</div>
						<div className='grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1'>
							<div className='col-start-1 col-end-13 lg:col-end-13'>
								<TxnCard />
							</div>
						</div>
					</section>
				) : (
					<section>
						<div className='mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto'>
							<div className='col-start-1 col-end-13 lg:col-end-8'>
								<OrganisationAssets
									transactionLoading={transactionLoading}
									setOpenTransactionModal={setOpenTransactionModal}
									openTransactionModal={openTransactionModal}
									setNewTxn={() => {}}
								/>
							</div>
							<div className='col-start-1 col-end-13 lg:col-start-8 h-full'>
								<TopAssetsCard />
							</div>
						</div>
						<OrgInfoTable />
					</section>
				)
			) : (
				<section className='bg-bg-main flex justify-center items-center p-5 rounded-lg scale-90 w-[111%] h-[111%] origin-top-left'>
					<AddMultisig
						// className='mt-4'
						homepage
					/>
				</section>
			)}
		</>
	);
};

export default Home;
