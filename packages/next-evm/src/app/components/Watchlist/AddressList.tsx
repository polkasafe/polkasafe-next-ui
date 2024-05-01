import React, { useState } from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DeleteIcon, WatchIcon } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { chainProperties } from '@next-common/global/evm-network-constants';
import RemoveFromWatchlist from './RemoveFromWatchlist';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

const RemoveAddressModal = ({ name, address, network }: { address: string; name: string; network: string }) => {
	const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
	return (
		<>
			<Tooltip title='Delete'>
				<button
					onClick={() => setOpenRemoveModal(true)}
					className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
				>
					<DeleteIcon />
				</button>
			</Tooltip>
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Address</h3>}
				open={openRemoveModal}
				onCancel={() => setOpenRemoveModal(false)}
			>
				<RemoveFromWatchlist
					address={address}
					name={name}
					network={network}
					onCancel={() => setOpenRemoveModal(false)}
				/>
			</ModalComponent>
		</>
	);
};

const AddressList = () => {
	const { watchlists } = useGlobalUserDetailsContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const baseURL = typeof window !== 'undefined' && global.window.location.origin;

	interface DataType {
		key: React.Key;
		name: React.ReactNode;
		address: React.ReactNode;
		network: React.ReactNode;
		actions: React.ReactNode;
	}

	const columns: ColumnsType<DataType> = [
		{
			dataIndex: 'name',
			fixed: 'left',
			key: 'name',
			title: 'Name',
			width: 250
		},
		{
			dataIndex: 'address',
			fixed: 'left',
			key: 'address',
			title: 'Address',
			width: 350
		},
		{
			dataIndex: 'network',
			key: 'network',
			title: 'Network',
			width: 200
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 200
		}
	];

	const watchlistData: DataType[] = Object.keys(watchlists)?.map((item) => ({
		actions: (
			<div className='flex items-center gap-x-2'>
				{/* <Tooltip title='Watch'>
					<a
						target='_blank'
						href={`${baseURL}?safe=${watchlists[item]?.address}&network=${watchlists[item]?.network}`}
						rel='noreferrer'
					>
						<button className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
							<WatchIcon />
						</button>
					</a>
				</Tooltip> */}
				<RemoveAddressModal
					address={watchlists[item]?.address}
					name={watchlists[item]?.name}
					network={watchlists[item]?.network}
				/>
			</div>
		),
		address: (
			<AddressComponent
				address={watchlists[item]?.address}
				onlyAddress
				withBadge={false}
			/>
		),
		key: item,
		name: watchlists[item]?.name,
		network: (
			<div className='capitalize px-1 flex items-center gap-x-2'>
				<ParachainIcon src={chainProperties[watchlists[item]?.network]?.logo} /> {watchlists[item]?.network}
			</div>
		)
	}));

	return (
		<div className='text-sm font-medium overflow-y-auto scale-[80%] h-[125%] w-[125%] origin-top-left'>
			<Table
				columns={columns}
				pagination={false}
				dataSource={watchlistData}
				scroll={{ x: 1000, y: 500 }}
			/>
		</div>
	);
};

export default AddressList;
