// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AddAddrIcon from '@next-common/assets/icons/add-addr-icon.svg';
import AddAdress from '@next-substrate/app/components/AddressBook/AddAddress';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { RightArrowOutlined } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import Image from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';

const AddressCard = ({ className }: { className?: string }) => {
	const { network } = useGlobalApiContext();
	const { records } = useActiveMultisigContext();
	const { addressBook } = useGlobalUserDetailsContext();

	const [addresses, setAddresses] = useState<string[]>([]);
	const [openAddressModal, setOpenAddressModal] = useState<boolean>(false);

	useEffect(() => {
		const allAddresses: string[] = [];
		if (records) {
			Object.keys(records).forEach((address) => {
				allAddresses.push(getEncodedAddress(address, network) || address);
			});
		}
		addressBook.forEach((item) => {
			if (!allAddresses.includes(getEncodedAddress(item.address, network) || item.address)) {
				allAddresses.push(item.address);
			}
		});
		setAddresses(allAddresses);
	}, [addressBook, network, records]);

	return (
		<div>
			<ModalComponent
				open={openAddressModal}
				onCancel={() => setOpenAddressModal(false)}
				title='Add Address'
			>
				<AddAdress />
			</ModalComponent>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Address Book</h2>
				<div className='flex items-center justify-center text-primary cursor-pointer'>
					<Link
						href='/address-book'
						className='mx-2 text-primary text-sm'
					>
						View All
					</Link>
					<RightArrowOutlined />
				</div>
			</div>
			<div
				className={`${className} bg-bg-main flex flex-col justify-around rounded-lg py-5 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left`}
			>
				<div className='flex flex-col px-5 h-[18rem] overflow-auto w-[full]'>
					{addresses.map((item, i) => (
						<div key={i}>
							<AddressComponent
								iconSize={25}
								address={item}
							/>
							{addresses.length - 1 !== i ? <Divider className='bg-text_secondary mt-2 mb-3' /> : null}
						</div>
					))}
				</div>
				<div className='w-full mt-5 flex justify-center'>
					<PrimaryButton
						secondary
						className='w-[90%] flex items-center justify-center py-4 2xl:py-5'
						onClick={() => setOpenAddressModal(true)}
					>
						<Image
							className='group-hover:fill-white'
							src={AddAddrIcon}
							alt='add'
						/>
						<p className='px-2 text-primary'>Add Address</p>
					</PrimaryButton>
				</div>
				{/* TODO: Empty state */}
				{/* <img src={bookmark} alt="save" />
				<p className='w-[50%]'>You don't have any saved addresses in your address book.</p>
				<PrimaryButton className='w-[90%] mt-5' onClick={() => { }}>+ Add Address</PrimaryButton> */}
			</div>
		</div>
	);
};

export default AddressCard;
