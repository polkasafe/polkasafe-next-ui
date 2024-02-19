// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Button, Divider, Modal } from 'antd';
import React, { useState } from 'react';
import EditAddress from '@next-substrate/app/components/AddressBook/Edit';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import {
	CopyIcon,
	DeleteIcon,
	EditIcon,
	ExternalLinkIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import styled from 'styled-components';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { IMultisigAddress } from '@next-common/types';
import RemoveOwner from './Remove';

const RemoveSignatoryModal = ({
	address,
	className,
	signatoriesLength,
	threshold
}: {
	address: string;
	className?: string;
	signatoriesLength: number;
	threshold: number;
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
				className={`${className} w-auto md:min-w-[500px] scale-90 origin-center`}
			>
				<RemoveOwner
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
	const { activeOrg } = useActiveOrgContext();
	const { address: userAddress } = useGlobalUserDetailsContext();
	const userAddressObject = activeOrg?.addressBook?.find((item) => item.address === userAddress);

	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>Name</span>
				<span className='col-span-2'>Address</span>
				<span className='col-span-1'>Action</span>
			</article>
			<article>
				<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
					<p className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
						{userAddressObject?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<div className='col-span-2 flex items-center'>
						<Identicon
							className='image identicon mx-2'
							value={userAddress}
							size={30}
							theme='polkadot'
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
								onClick={() => copyText(userAddress, true, multisig.network)}
							>
								<CopyIcon />
							</button>
							<a
								href={`https://${multisig.network}.subscan.io/account/${userAddress}`}
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
			{multisig.signatories
				?.filter((item) => item !== userAddress)
				.map((address, index) => {
					const addressObject = activeOrg?.addressBook?.find((item) => item?.address === address);
					const encodedAddress = getEncodedAddress(address, multisig.network);
					return (
						<article key={index}>
							<div className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'>
								<p className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-base'>
									{addressObject?.nickName || addressObject?.name || DEFAULT_ADDRESS_NAME}
								</p>
								<div className='col-span-2 flex items-center'>
									<Identicon
										className='image identicon mx-2'
										value={encodedAddress}
										size={30}
										theme='polkadot'
									/>
									<span
										title={encodedAddress || address}
										className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
									>
										{shortenAddress(encodedAddress || address, 10)}
									</span>
									<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
										<button
											className='hover:text-primary'
											onClick={() => copyText(address, true, multisig.network)}
										>
											<CopyIcon />
										</button>
										<a
											href={`https://${multisig.network}.subscan.io/account/${encodedAddress}`}
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
										addressToEdit={address}
										nameToEdit={addressObject?.name}
										emailToEdit={addressObject?.email}
										discordToEdit={addressObject?.discord}
										telegramToEdit={addressObject?.telegram}
										rolesToEdit={addressObject?.roles}
									/>
									{multisig.signatories.length > 2 && !disabled && (
										<RemoveSignatoryModal
											threshold={multisig?.threshold || 2}
											className={className}
											signatoriesLength={multisig.signatories.length || 2}
											address={address}
										/>
									)}
								</div>
							</div>
							{multisig.signatories.length - 1 !== index ? <Divider className='bg-text_secondary my-0' /> : null}
						</article>
					);
				})}
		</div>
	);
};

export default styled(ListOwners)`
	.ant-spin-nested-loading .ant-spin-blur {
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after {
		opacity: 1 !important;
	}
`;
