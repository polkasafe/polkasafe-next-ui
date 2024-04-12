// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { Form, Input } from 'antd';
import { useState } from 'react';
import addToAddressBook from '@next-evm/utils/addToAddressBook';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { DefaultOptionType } from 'antd/es/select';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import CancelBtn from '../Multisig/CancelBtn';
import ModalBtn from '../Multisig/ModalBtn';

const AddAddressModal = ({
	defaultAddress,
	showAddressModal,
	setShowAddressModal,
	setAutoCompleteAddresses
}: {
	defaultAddress: string;
	showAddressModal: boolean;
	setShowAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
	setAutoCompleteAddresses: React.Dispatch<React.SetStateAction<DefaultOptionType[]>>;
}) => {
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const [addAddressName, setAddAddressName] = useState('');
	const [addAddressLoading, setAddAddressLoading] = useState(false);

	const handleAddAddress = async () => {
		setAddAddressLoading(true);
		const newAddresses = await addToAddressBook({
			address: defaultAddress,
			addressBook: activeOrg?.addressBook || [],
			name: addAddressName,
			organisationId: activeOrg.id
		});
		setAddAddressLoading(false);
		if (newAddresses) {
			setAutoCompleteAddresses(
				newAddresses.map((item) => ({
					label: (
						<AddressComponent
							name={item.name}
							address={item.address}
						/>
					),
					value: item.address
				}))
			);
			setActiveOrg((prev) => ({
				...prev,
				addressBook: newAddresses
			}));
		}
		setShowAddressModal(false);
		queueNotification({
			header: 'Successful!',
			message: 'Your Address has been Added.',
			status: NotificationStatus.SUCCESS
		});
	};
	return (
		<ModalComponent
			title={<h3 className='text-white mb-8 text-lg font-semibold'>Add Address</h3>}
			onCancel={() => setShowAddressModal(false)}
			open={showAddressModal}
		>
			<Form className='my-0 w-[560px]'>
				<div className='flex flex-col gap-y-3'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='name'
					>
						Name
					</label>
					<Form.Item
						name='name'
						rules={[
							{
								message: 'Required',
								required: true
							}
						]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							placeholder='Give the address a name'
							className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
							id='name'
							onChange={(e) => setAddAddressName(e.target.value)}
							value={addAddressName}
						/>
					</Form.Item>
				</div>
				<div className='flex flex-col gap-y-3 mt-5'>
					<label
						className='text-primary text-xs leading-[13px] font-normal'
						htmlFor='address'
					>
						Address
					</label>
					<Form.Item
						name='address'
						rules={[]}
						className='border-0 outline-0 my-0 p-0'
					>
						<Input
							className='text-sm font-normal leading-[15px] outline-0 p-2.5 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24'
							id='address'
							defaultValue={defaultAddress}
							disabled
						/>
					</Form.Item>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<CancelBtn
						loading={addAddressLoading}
						onClick={() => setShowAddressModal(false)}
					/>
					<ModalBtn
						loading={addAddressLoading}
						disabled={!addAddressName || !defaultAddress}
						title='Add'
						onClick={handleAddAddress}
					/>
				</div>
			</Form>
		</ModalComponent>
	);
};

export default AddAddressModal;
