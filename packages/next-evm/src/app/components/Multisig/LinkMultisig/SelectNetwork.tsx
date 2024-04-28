// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import NetworkCard, { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

// import Loader from '../../UserFlow/Loader';

const SelectNetwork = ({
	network,
	setNetwork
}: {
	network: NETWORK;
	setNetwork: React.Dispatch<React.SetStateAction<NETWORK>>;
}) => {
	const networkOptions: ItemType[] = Object.values(NETWORK).map((item) => ({
		key: item,
		label: (
			<NetworkCard
				selectedNetwork={network}
				key={item}
				network={item}
			/>
		)
	}));

	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className='flex justify-around items-center w-full mb-10'>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>1</div>
						<p>Select Network</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Name & Address</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					<p className='text-primary mt-10 w-[500px]'>Select a network on which the safe was created</p>
				</div>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-1.5 bg-bg-secondary cursor-pointer min-w-[150px]'
					menu={{
						items: networkOptions,
						onClick: (e) => setNetwork(e.key as NETWORK)
					}}
				>
					<div className='flex justify-between items-center text-white gap-x-2'>
						<div className='capitalize flex items-center gap-x-2 text-sm'>
							<ParachainIcon
								size={15}
								src={chainProperties[network]?.logo}
							/>
							{network}
						</div>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
		</div>
	);
};

export default SelectNetwork;
