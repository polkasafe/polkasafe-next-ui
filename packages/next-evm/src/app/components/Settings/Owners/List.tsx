// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import React, { useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import EditAddress from '@next-evm/app/components/AddressBook/Edit';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ExternalLinkIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';

import { chainProperties } from '@next-common/global/evm-network-constants';
import { IMultisigAddress } from '@next-common/types';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import RemoveOwner from './Remove';

const RemoveSignatoryModal = ({
	address,
	className,
	signatoriesLength,
	threshold,
	multisig
}: {
	address: string;
	className?: string;
	signatoriesLength: number;
	threshold: number;
	multisig: IMultisigAddress;
}) => {
	const [openRemoveSignatoryModal, setOpenRemoveSignatoryModal] = useState(false);
	return (
		<>
			<Button
				onClick={() => setOpenRemoveSignatoryModal(true)}
				className='text-failure border-none outline-none bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'
			>
				<DeleteIcon />
			</Button>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenRemoveSignatoryModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>
				}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Signatory</h3>}
				open={openRemoveSignatoryModal}
				className={`${className} w-auto md:min-w-[500px]`}
			>
				<RemoveOwner
					multisig={multisig}
					onCancel={() => setOpenRemoveSignatoryModal(false)}
					oldSignatoriesLength={signatoriesLength}
					oldThreshold={threshold}
					addressToRemove={address}
				/>
			</Modal>
		</>
	);
};

const EditAddressModal = ({
	className,
	addressToEdit,
	nameToEdit,
	discordToEdit,
	emailToEdit,
	telegramToEdit,
	rolesToEdit,
	nickNameToEdit
}: {
	className?: string;
	nickNameToEdit?: string;
	addressToEdit: string;
	nameToEdit?: string;
	discordToEdit?: string;
	emailToEdit?: string;
	telegramToEdit?: string;
	rolesToEdit?: string[];
}) => {
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	return (
		<>
			<Button
				onClick={() => setOpenEditModal(true)}
				className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8 border-none outline-none'
			>
				<EditIcon className='' />
			</Button>
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
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Edit Address</h3>}
				open={openEditModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditAddress
					onCancel={() => setOpenEditModal(false)}
					className={className}
					addressToEdit={addressToEdit}
					nameToEdit={nameToEdit}
					discordToEdit={discordToEdit}
					emailToEdit={emailToEdit}
					rolesToEdit={rolesToEdit}
					telegramToEdit={telegramToEdit}
					nickNameToEdit={nickNameToEdit}
				/>
			</Modal>
		</>
	);
};

const ListOwners = ({
	className,
	disabled,
	multisig
}: {
	className?: string;
	disabled?: boolean;
	multisig: IMultisigAddress;
}) => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const signatories = multisig?.signatories;
	const userAddressObject = activeOrg?.addressBook?.find((item) => item?.address === userAddress);

	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>Name</span>
				<span className='col-span-2'>Address</span>
				<span className='col-span-1'>Action</span>
			</article>
			<article>
				<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
					<p className=' sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
						{activeOrg?.addressBook?.find((item: any) => item?.address === userAddress)?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<div className='col-span-2 flex items-center'>
						<MetaMaskAvatar
							address={userAddress}
							size={30}
						/>
						<span
							title={userAddress}
							className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
						>
							{userAddress}
						</span>
						<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
							<button
								className='hover:text-primary'
								onClick={() => copyText(userAddress)}
							>
								<CopyIcon />
							</button>
							<a
								href={`${chainProperties[multisig?.network]?.blockExplorer}/address/${userAddress}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</div>
					</div>
					<div className='col-span-1 flex items-center gap-x-[10px]'>
						<EditAddressModal
							className={className}
							nickNameToEdit={userAddressObject?.nickName}
							addressToEdit={userAddressObject?.address || ''}
							nameToEdit={userAddressObject?.name}
							emailToEdit={userAddressObject?.email}
							discordToEdit={userAddressObject?.discord}
							telegramToEdit={userAddressObject?.telegram}
							rolesToEdit={userAddressObject?.roles}
						/>
					</div>
				</div>
				<Divider className='bg-text_secondary my-0' />
			</article>
			{signatories
				?.filter((item: any) => item !== userAddress)
				.map((address: any, index: any) => {
					const addressObject = activeOrg?.addressBook?.find((item) => item?.address === address);
					const encodedAddress = address;
					return (
						<article key={index}>
							<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
								<p className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
									{addressObject?.nickName || addressObject?.name || DEFAULT_ADDRESS_NAME}
								</p>
								<div className='col-span-2 flex items-center'>
									<MetaMaskAvatar
										address={encodedAddress}
										size={30}
									/>
									<span
										title={encodedAddress || address}
										className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
									>
										{encodedAddress}
									</span>
									<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
										<button
											className='hover:text-primary'
											onClick={() => copyText(address)}
										>
											<CopyIcon />
										</button>
										<a
											href={`${chainProperties[multisig?.network]?.blockExplorer}/address/${encodedAddress}`}
											target='_blank'
											rel='noreferrer'
										>
											<ExternalLinkIcon />
										</a>
									</div>
								</div>
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									<EditAddressModal
										className={className}
										nickNameToEdit={addressObject?.nickName}
										addressToEdit={address || ''}
										nameToEdit={addressObject?.name}
										emailToEdit={addressObject?.email}
										discordToEdit={addressObject?.discord}
										telegramToEdit={addressObject?.telegram}
										rolesToEdit={addressObject?.roles}
									/>
									{signatories.length > 1 && !disabled && (
										<RemoveSignatoryModal
											multisig={multisig}
											threshold={multisig?.threshold || 2}
											className={className}
											signatoriesLength={signatories.length || 2}
											address={address}
										/>
									)}
								</div>
							</div>
							{signatories.length - 1 !== index ? <Divider className='bg-text_secondary my-0' /> : null}
						</article>
					);
				})}
		</div>
	);
};

export default ListOwners;
