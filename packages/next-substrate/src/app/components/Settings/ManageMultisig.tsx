// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ArrowRightOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import Details from '@next-substrate/app/components/Settings/Details';
import Feedback from '@next-substrate/app/components/Settings/Feedback';
import AddNewOwnerBtn from '@next-substrate/app/components/Settings/Owners/AddBtn';
import ListOwners from '@next-substrate/app/components/Settings/Owners/List';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CircleArrowDownIcon, CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { networks } from '@next-common/global/networkConstants';
import { IMultisigAddress } from '@next-common/types';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { Dropdown } from 'antd';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import ChangeCurrency from './ChangeCurrency';

// eslint-disable-next-line sonarjs/cognitive-complexity
const ManageMultisig = () => {
	const { activeMultisig, userID } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const activeMultisigData = activeMultisig
		? activeOrg?.multisigs.find(
				(item) => item.address === activeMultisig || checkMultisigWithProxy(item.address, activeMultisig)
		  )
		: undefined;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [network, setNetwork] = useState<string>(
		activeMultisigData?.network || activeOrg?.multisigs?.[0]?.network || networks.POLKADOT
	);
	const [selectedMultisig, setSelectedMultisig] = useState<IMultisigAddress>(
		activeMultisigData || activeOrg?.multisigs?.[0]
	);

	const [selectedProxy, setSelectedProxy] = useState<{ address: string; name: string }>({
		address: '',
		name: DEFAULT_ADDRESS_NAME
	});

	useEffect(() => {
		if (!activeOrg || !activeOrg.multisigs) return;

		if (activeMultisig) {
			const m = activeOrg?.multisigs.find((item) => item.address === activeMultisig);
			setSelectedMultisig(m);
			return;
		}
		setSelectedMultisig(activeOrg?.multisigs?.[0]);
	}, [activeMultisig, activeOrg]);

	useEffect(() => {
		setSelectedProxy({
			address: selectedMultisig?.proxy
				? typeof selectedMultisig.proxy !== 'string'
					? selectedMultisig?.proxy?.[0]?.address
					: selectedMultisig?.proxy
				: '',
			name: selectedMultisig?.proxy
				? typeof selectedMultisig.proxy !== 'string'
					? selectedMultisig?.proxy?.[0]?.name
					: selectedMultisig.name
				: DEFAULT_ADDRESS_NAME
		});
	}, [selectedMultisig]);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network}
					withBadge={false}
					address={item.address}
				/>
			</div>
		)
	}));

	const multisigOptionsWithProxy: ItemType[] =
		selectedMultisig?.proxy && typeof selectedMultisig.proxy === 'string'
			? [
					{
						key: JSON.stringify(selectedMultisig.proxy),
						label: (
							<div className='scale-90 origin-top-left'>
								<AddressComponent
									isProxy
									isMultisig
									showNetworkBadge
									network={selectedMultisig.network}
									withBadge={false}
									address={selectedMultisig.proxy}
								/>
							</div>
						)
					}
			  ]
			: (selectedMultisig?.proxy && typeof selectedMultisig.proxy !== 'string' ? selectedMultisig.proxy : []).map(
					(mp) => ({
						key: JSON.stringify({ address: mp.address, name: mp.name }),
						label: (
							<div className='scale-90 origin-top-left'>
								<AddressComponent
									isProxy
									name={mp.name}
									isMultisig
									showNetworkBadge
									network={selectedMultisig.network}
									withBadge={false}
									address={mp.address}
								/>
							</div>
						)
					})
			  );

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
					<h2 className='font-bold text-xl leading-[22px] text-white mb-6'>Manage Safe Owners</h2>
					<div className='flex justify-start mb-4'>
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[260px]'
							menu={{
								items: multisigOptions,
								onClick: (e) => {
									console.log(JSON.parse(e.key));
									setSelectedMultisig(JSON.parse(e.key) as IMultisigAddress);
									setNetwork(JSON.parse(e.key)?.network);
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
					</div>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden max-sm:'>
						{selectedMultisig?.proxy ? (
							<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
								<div className='bg-bg-secondary rounded-lg p-3 w-auto flex items-center gap-x-4 max-sm:flex-col max-sm:w-full'>
									<div className='flex flex-col items-start max-sm:w-full'>
										<div className='px-2 mb-1 py-[2px] rounded-md text-xs font-medium bg-primary text-white'>
											Multisig
										</div>
										<div className='flex items-center text-text_secondary'>
											{shortenAddress(selectedMultisig?.address || '', 10)}
											<button
												className='ml-2 mr-1'
												onClick={() => copyText(selectedMultisig?.address || '', true, network)}
											>
												<CopyIcon />
											</button>
											<a
												href={`https://${network}.subscan.io/account/${getEncodedAddress(
													selectedMultisig?.address || '',
													network
												)}`}
												target='_blank'
												rel='noreferrer'
											>
												<ExternalLinkIcon />
											</a>
										</div>
									</div>
									<div className='h-[50px] w-[50px] rounded-full flex items-center justify-center bg-text_secondary text-bg-main text-xl max-sm:my-2'>
										<ArrowRightOutlined />
									</div>
									{typeof selectedMultisig.proxy === 'string' ? (
										<div className='flex flex-col items-start max-sm:w-full'>
											<div className='px-2 mb-1 py-[2px] rounded-md text-xs font-medium bg-[#FF79F2] text-highlight'>
												Proxy
											</div>
											<div className='flex items-center text-text_secondary'>
												{shortenAddress(selectedMultisig?.proxy || '', 10)}
												<button
													className='ml-2 mr-1'
													onClick={() => copyText((selectedMultisig?.proxy as string) || '', true, network)}
												>
													<CopyIcon />
												</button>
												<a
													href={`https://${network}.subscan.io/account/${getEncodedAddress(
														selectedMultisig?.proxy || '',
														network
													)}`}
													target='_blank'
													rel='noreferrer'
												>
													<ExternalLinkIcon />
												</a>
											</div>
										</div>
									) : selectedMultisig.proxy.length > 0 ? (
										<Dropdown
											trigger={['click']}
											className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px] max-sm:w-full'
											menu={{
												items: multisigOptionsWithProxy,
												onClick: (e) => {
													const data = JSON.parse(e.key);
													setSelectedProxy({ address: data.address, name: data.name });
												}
											}}
										>
											<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
												<AddressComponent
													isMultisig
													isProxy
													name={selectedProxy.name}
													showNetworkBadge
													network={network}
													withBadge={false}
													address={selectedProxy.address}
												/>
												<CircleArrowDownIcon className='text-primary' />
											</div>
										</Dropdown>
									) : null}
								</div>
								<AddNewOwnerBtn
									disabled={!selectedMultisig?.proxy}
									selectedProxy={selectedProxy}
								/>
							</section>
						) : (
							!['alephzero'].includes(network) && (
								<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
									<p className='text-white'>Create a proxy to edit or backup your Multisig.</p>
								</section>
							)
						)}
						<section>
							{selectedMultisig && (
								<ListOwners
									multisig={selectedMultisig}
									disabled={!selectedMultisig?.proxy}
									selectedProxy={selectedProxy}
								/>
							)}
						</section>
					</div>
				</>
			)}
			{userID && (
				<div className='mt-[30px] flex gap-x-[30px] max-sm:flex-col'>
					{selectedMultisig && (
						<section className='w-full'>
							<Details multisig={selectedMultisig} />
						</section>
					)}
					<section className='w-full max-w-[50%] max-sm:max-w-full'>
						<Feedback />
					</section>
				</div>
			)}
			<div className='mt-[30px] flex gap-x-[30px]'>
				<ChangeCurrency />
			</div>
		</div>
	);
};

export default ManageMultisig;
