// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import Details from '@next-evm/app/components/Settings/Details';
import Feedback from '@next-evm/app/components/Settings/Feedback';
import AddNewOwnerBtn from '@next-evm/app/components/Settings/Owners/AddBtn';
import ListOwners from '@next-evm/app/components/Settings/Owners/List';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { Dropdown } from 'antd';
import { IMultisigAddress } from '@next-common/types';

const ManageMultisig = () => {
	const { activeMultisig, userID } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const activeMultisigData = activeMultisig && activeOrg?.multisigs.find((item) => item.address === activeMultisig);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [network, setNetwork] = useState<NETWORK>(
		(activeMultisigData?.network as NETWORK) || (activeOrg?.multisigs?.[0]?.network as NETWORK) || NETWORK.POLYGON
	);
	const [selectedMultisig, setSelectedMultisig] = useState<IMultisigAddress>(
		activeMultisigData || activeOrg?.multisigs?.[0]
	);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network as NETWORK}
					withBadge={false}
					address={item.address}
				/>
			</div>
		)
	}));

	return (
		<div>
			{!activeOrg || !activeOrg?.multisigs || activeOrg?.multisigs?.length === 0 ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>
						Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.
					</p>
				</section>
			) : (
				<>
					<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>Manage Safe Owners</h2>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
						<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
							<Dropdown
								trigger={['click']}
								className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[260px]'
								menu={{
									items: multisigOptions,
									onClick: (e) => {
										console.log(JSON.parse(e.key));
										setSelectedMultisig(JSON.parse(e.key) as IMultisigAddress);
										setNetwork(JSON.parse(e.key)?.network as NETWORK);
									}
								}}
							>
								<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
									<AddressComponent
										isMultisig
										showNetworkBadge
										network={network}
										withBadge={false}
										address={selectedMultisig?.address}
									/>
									<CircleArrowDownIcon className='text-primary' />
								</div>
							</Dropdown>
							<AddNewOwnerBtn
								multisig={selectedMultisig}
								disabled={false}
							/>
						</section>
						<section>
							<ListOwners multisig={selectedMultisig} />
						</section>
					</div>
				</>
			)}
			{userID && (
				<div className='mt-[30px] flex gap-x-[30px]'>
					{selectedMultisig && (
						<section className='w-full'>
							<Details multisig={selectedMultisig} />
						</section>
					)}
					<section className='w-full max-w-[50%]'>
						<Feedback />
					</section>
				</div>
			)}
		</div>
	);
};

export default ManageMultisig;
