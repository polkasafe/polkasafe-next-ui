// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Dropdown, Modal, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { FC, useState } from 'react';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { IAllAddresses } from '@next-common/types';
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ExternalLinkIcon,
	OutlineCloseIcon,
	SharedIcon
} from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import copyText from '@next-substrate/utils/copyText';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import SendFundsForm from '../SendFunds/SendFundsForm';
import EditAddress from './Edit';
import RemoveAddress from './Remove';

export interface IAddress {
	name: string;
	address: string;
}
interface IAddressProps {
	addresses: IAllAddresses;
	className?: string;
}

const TransactionModal = ({ className, defaultAddress }: { className?: string; defaultAddress: string }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState<boolean>(false);
	const { activeMultisig } = useGlobalUserDetailsContext();
	return (
		<>
			{activeMultisig && (
				<PrimaryButton
					disabled={!activeMultisig}
					className='bg-primary text-white w-fit'
					onClick={() => setOpenTransactionModal(true)}
				>
					<p className='font-normal text-sm'>Send</p>
				</PrimaryButton>
			)}
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenTransactionModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>
				}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<SendFundsForm
					defaultSelectedAddress={defaultAddress}
					onCancel={() => setOpenTransactionModal(false)}
				/>
			</Modal>
		</>
	);
};

export const EditAddressModal = ({
	className,
	addressToEdit,
	nameToEdit,
	nickNameToEdit,
	discordToEdit,
	emailToEdit,
	telegramToEdit,
	rolesToEdit,
	personalToShared
}: {
	personalToShared?: boolean;
	className?: string;
	addressToEdit: string;
	nameToEdit?: string;
	nickNameToEdit?: string;
	discordToEdit?: string;
	emailToEdit?: string;
	telegramToEdit?: string;
	rolesToEdit?: string[];
}) => {
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	return (
		<>
			<button
				onClick={() => setOpenEditModal(true)}
				className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
			>
				<EditIcon />
			</button>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenEditModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>
				}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>
						{personalToShared ? 'Add to Shared Address Book' : 'Edit Address'}
					</h3>
				}
				open={openEditModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditAddress
					onCancel={() => setOpenEditModal(false)}
					className={className}
					addressToEdit={addressToEdit}
					nameToEdit={nameToEdit}
					nickNameToEdit={nickNameToEdit}
					discordToEdit={discordToEdit}
					emailToEdit={emailToEdit}
					rolesToEdit={rolesToEdit}
					telegramToEdit={telegramToEdit}
					personalToShared={personalToShared}
				/>
			</Modal>
		</>
	);
};

export const RemoveAddressModal = ({
	addresses,
	address,
	userAddress,
	members
}: {
	addresses: IAllAddresses;
	address: string;
	userAddress: string;
	members: string[];
}) => {
	const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
	return (
		<>
			{address !== userAddress && !members.includes(address) && (
				<button
					onClick={() => setOpenRemoveModal(true)}
					className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
				>
					<DeleteIcon />
				</button>
			)}
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Address</h3>}
				open={openRemoveModal}
				onCancel={() => setOpenRemoveModal(false)}
			>
				<RemoveAddress
					addressToRemove={address}
					name={addresses[address]?.name}
					onCancel={() => setOpenRemoveModal(false)}
				/>
			</ModalComponent>
		</>
	);
};

const AddressTable: FC<IAddressProps> = ({ addresses, className }) => {
	const { activeOrg } = useActiveOrgContext();
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	interface DataType {
		key: React.Key;
		name: React.ReactNode;
		address: React.ReactNode;
		email: React.ReactNode;
		discord: React.ReactNode;
		telegram: React.ReactNode;
		roles: React.ReactNode;
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
			width: 250
		},
		{
			dataIndex: 'email',
			key: 'email',
			title: 'Email',
			width: 250
		},
		{
			dataIndex: 'discord',
			key: 'discord',
			title: 'Discord',
			width: 200
		},
		{
			dataIndex: 'telegram',
			key: 'telegram',
			title: 'Telegram',
			width: 200
		},
		{
			dataIndex: 'roles',
			key: 'roles',
			title: 'Roles',
			width: 300
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 200
		}
	];

	const smallColumns: ColumnsType<DataType> = [
		{
			dataIndex: 'name',
			fixed: 'left',
			key: 'name',
			title: 'Name',
			width: 150
		},
		{
			dataIndex: 'address',
			fixed: 'left',
			key: 'address',
			title: 'Address',
			width: 150
		},
		{
			dataIndex: 'email',
			key: 'email',
			title: 'Email',
			width: 150
		},
		{
			dataIndex: 'discord',
			key: 'discord',
			title: 'Discord',
			width: 100
		},
		{
			dataIndex: 'telegram',
			key: 'telegram',
			title: 'Telegram',
			width: 100
		},
		{
			dataIndex: 'roles',
			key: 'roles',
			title: 'Roles',
			width: 100
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 50
		}
	];

	const addressBookData: DataType[] = Object.keys(addresses)?.map((address) => {
		const encodedAddress = getSubstrateAddress(address);
		return {
			actions: (
				<div className=' flex items-center justify-right gap-x-[10px]'>
					<EditAddressModal
						className={className}
						nickNameToEdit={addresses[address]?.nickName}
						addressToEdit={encodedAddress}
						nameToEdit={addresses[address]?.name}
						discordToEdit={addresses[address]?.discord}
						emailToEdit={addresses[address]?.email}
						rolesToEdit={addresses[address]?.roles}
						telegramToEdit={addresses[address]?.telegram}
					/>
					<RemoveAddressModal
						addresses={addresses}
						address={address}
						userAddress={userAddress}
						members={activeOrg && activeOrg.members ? activeOrg.members : []}
					/>
					<TransactionModal
						defaultAddress={encodedAddress}
						className={className}
					/>
				</div>
			),
			address: (
				<div className='flex items-center'>
					<Identicon
						className='image identicon mx-2'
						value={encodedAddress}
						size={30}
						theme='polkadot'
					/>
					<span
						title={encodedAddress}
						className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
					>
						{shortenAddress(encodedAddress)}
					</span>
					<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
						<button
							className='hover:text-primary'
							onClick={() => copyText(encodedAddress)}
						>
							<CopyIcon />
						</button>
						<a
							href={`https://www.subscan.io/account/${encodedAddress}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</div>
				</div>
			),
			discord: <div className='truncate'>{addresses[address]?.discord ? addresses[address].discord : '-'}</div>,
			email: <div className='truncate'>{addresses[address]?.email ? addresses[address].email : '-'}</div>,
			key: address,
			name: (
				<p
					title={addresses[address]?.name || DEFAULT_ADDRESS_NAME}
					className='sm:w-auto h-[64px] overflow-hidden text-ellipsis flex items-center justify-between text-base'
				>
					<div className='h-full flex flex-col justify-center gap-y-1'>
						<div className='flex items-center truncate'>
							{addresses[address]?.name || DEFAULT_ADDRESS_NAME}
							{encodedAddress === userAddress && (
								<Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}>
									<Badge
										className='ml-2'
										status='success'
									/>
								</Tooltip>
							)}
							{addresses[address].shared && (
								<Tooltip
									className='ml-2'
									title={<span className='text-sm text-text_secondary'>Shared Address</span>}
								>
									<SharedIcon className='text-primary' />
								</Tooltip>
							)}
						</div>
						{addresses?.[address]?.nickName && <div className='text-sm'>({addresses?.[address]?.nickName})</div>}
					</div>
					{records && Object.keys(records)?.length > 0 && !Object.keys(records).includes(address) && (
						<EditAddressModal
							className={className}
							nickNameToEdit={addresses[address]?.nickName}
							addressToEdit={encodedAddress}
							nameToEdit={addresses[address]?.name}
							discordToEdit={addresses[address]?.discord}
							emailToEdit={addresses[address]?.email}
							rolesToEdit={addresses[address]?.roles}
							telegramToEdit={addresses[address]?.telegram}
							personalToShared
						/>
					)}
				</p>
			),
			roles: (
				<div className=' flex items-center gap-x-2'>
					{addresses[address] && addresses[address]?.roles && addresses[address].roles!.length > 0 ? (
						<>
							{addresses[address].roles?.slice(0, 2).map((role, i) => (
								<span
									key={i}
									className='bg-primary bg-opacity-10 border border-solid border-primary text-primary rounded-lg py-1 px-3 max-w-[120px] truncate'
								>
									{role}
								</span>
							))}
							{addresses[address]?.roles!.length > 2 && (
								<Dropdown
									menu={{
										items: addresses[address]?.roles?.slice(2).map((role, i) => ({
											key: i,
											label: (
												<span
													key={i}
													className='bg-primary bg-opacity-10 border border-solid border-primary text-primary rounded-lg py-1 px-3'
												>
													{role}
												</span>
											)
										}))
									}}
								>
									<span className='cursor-pointer py-1.5 px-3 rounded-full bg-primary'>
										+{addresses[address] && addresses[address].roles && addresses[address].roles.length - 2}
									</span>
								</Dropdown>
							)}
						</>
					) : (
						'-'
					)}
				</div>
			),
			telegram: <div className='truncate'>{addresses[address]?.telegram ? addresses[address].telegram : '-'}</div>
		};
	});

	return (
		<>
			<div className='text-sm font-medium overflow-y-auto max-sm:hidden'>
				<Table
					columns={columns}
					pagination={false}
					dataSource={addressBookData}
					scroll={{ x: 1000, y: 500 }}
				/>
			</div>
			<div className='text-sm font-medium overflow-y-auto sm:hidden'>
				<Table
					columns={smallColumns}
					pagination={false}
					dataSource={addressBookData}
					scroll={{ x: 2000, y: 500 }}
				/>
			</div>
		</>
	);
};

export default AddressTable;
