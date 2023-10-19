// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import './style.css';
import { Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AddAdress from '@next-substrate/app/components/AddressBook/AddAddress';
import AddressTable from '@next-substrate/app/components/AddressBook/AddressTable';
import ExportAdress from '@next-substrate/app/components/AddressBook/ExportAddress';
import ImportAdress from '@next-substrate/app/components/AddressBook/ImportAddress';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IAllAddresses } from '@next-common/types';
import {
	ExternalLinkIcon,
	SearchIcon,
	AddBoxIcon,
	ExportArrowIcon,
	ImportArrowIcon
} from '@next-common/ui-components/CustomIcons';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

const AddressBook = ({ className }: { className?: string }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const { address: userAddress, addressBook } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();
	const [addresses, setAddresses] = useState<IAllAddresses>({} as any);

	useEffect(() => {
		setAddresses({});
		const allAddresses: IAllAddresses = {};
		if (records) {
			Object.keys(records).forEach((address) => {
				allAddresses[address] = {
					address,
					discord: records[address].discord,
					email: records[address].email,
					name: records[address].name,
					nickName: '',
					roles: records[address].roles,
					shared: true,
					telegram: records[address].telegram
				};
			});
		}
		addressBook.forEach((item) => {
			const substrateAddress = getSubstrateAddress(item.address) || item.address;
			if (Object.keys(allAddresses).includes(substrateAddress)) {
				if (item.nickName) {
					allAddresses[substrateAddress].nickName = item.nickName;
				}
				if (!allAddresses[substrateAddress].name) {
					allAddresses[substrateAddress].name = item.name;
				}
			} else {
				allAddresses[substrateAddress] = {
					address: substrateAddress,
					discord: item.discord,
					email: item.email,
					name: item.name,
					nickName: item.nickName,
					roles: item.roles,
					shared: false,
					telegram: item.telegram
				};
			}
		});

		Object.keys(allAddresses)
			?.filter(
				(address) =>
					allAddresses[address]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					allAddresses[address]?.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					allAddresses[address]?.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
					records[address]?.roles?.includes(searchTerm)
			)
			.forEach((address) => {
				setAddresses((prev) => {
					return {
						...prev,
						[address]: {
							address: allAddresses[address]?.address,
							discord: allAddresses[address]?.discord,
							email: allAddresses[address]?.email,
							name: allAddresses[address]?.name,
							nickName: allAddresses[address]?.nickName,
							roles: allAddresses[address]?.roles,
							shared: allAddresses[address]?.shared,
							telegram: allAddresses[address]?.telegram
						}
					};
				});
			});
	}, [addressBook, records, searchTerm]);

	const [openAddAddressModal, setOpenAddAddressModal] = useState<boolean>(false);
	const [openImportAddressModal, setOpenImportAddressModal] = useState<boolean>(false);
	const [openExportAddressModal, setOpenExportAddressModal] = useState<boolean>(false);

	return (
		<div className='scale-[80%] w-[125%] h-[125%] p-5 origin-top-left bg-bg-main rounded-lg'>
			<AddMultisigModal />
			<ModalComponent
				onCancel={() => setOpenAddAddressModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Address</h3>}
				open={openAddAddressModal}
			>
				<AddAdress
					onCancel={() => setOpenAddAddressModal(false)}
					className={className}
				/>
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenImportAddressModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Import Address Book</h3>}
				open={openImportAddressModal}
			>
				<ImportAdress onCancel={() => setOpenImportAddressModal(false)} />
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenExportAddressModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Export Address Book</h3>}
				open={openExportAddressModal}
			>
				<ExportAdress
					records={addresses}
					onCancel={() => setOpenExportAddressModal(false)}
				/>
			</ModalComponent>
			{userAddress ? (
				<div>
					<div className='flex items-center justify-between'>
						<div className='rounded-lg bg-bg-secondary flex items-center mb-4 p-1 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
							<SearchIcon className='text-primary pl-3 pr-0' />
							<Input
								className='bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none min-w-[300px]'
								placeholder='Search by name or address'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className='flex'>
							<Button
								className='flex items-center justify-center bg-highlight text-primary mr-2 border-none'
								onClick={() => setOpenImportAddressModal(true)}
							>
								<ImportArrowIcon />
								Import
							</Button>
							<Button
								className='flex items-center justify-center bg-highlight text-primary mr-2 border-none'
								onClick={() => setOpenExportAddressModal(true)}
							>
								<ExportArrowIcon />
								Export
							</Button>
							<Button
								className='flex items-center justify-center bg-primary text-white border-none'
								onClick={() => setOpenAddAddressModal(true)}
							>
								<AddBoxIcon /> Add Address
							</Button>
						</div>
					</div>
					<div>
						<AddressTable addresses={addresses} />
					</div>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default AddressBook;
