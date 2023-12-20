import { WatchIcon } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import AddWatchlistAddressModal from './AddWatchlistAddressModal';

const AddWatchlistAddress = ({ className }: { className?: string }) => {
	const [address, setAddress] = useState<string>('');
	const [addressValid, setAddressValid] = useState<boolean>(true);
	const [openAddAddressModal, setOpenAddAddressModal] = useState<boolean>(false);

	useEffect(() => {
		if (isValidWeb3Address(address)) {
			setAddressValid(true);
		} else {
			setAddressValid(false);
		}
	}, [address]);

	return (
		<Form className={`flex gap-x-2 items-start ${className}`}>
			<ModalComponent
				title='Add Watchlist Address'
				open={openAddAddressModal}
				onCancel={() => setOpenAddAddressModal(false)}
			>
				<AddWatchlistAddressModal
					onCancel={() => setOpenAddAddressModal(false)}
					address={address}
				/>
			</ModalComponent>
			<Form.Item
				name='address'
				rules={[{ message: 'Address Required', required: true }]}
				validateStatus={address && !addressValid ? 'error' : 'success'}
				help={address && !addressValid && 'Please enter a valid address'}
				className='border-0 outline-0 my-0 p-0'
			>
				<Input
					placeholder='Enter Address'
					className='text-sm min-w-[300px] font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
					id='address'
					onChange={(e) => setAddress(e.target.value)}
					value={address}
				/>
			</Form.Item>
			<PrimaryButton
				icon={<WatchIcon />}
				size='large'
				disabled={!address || !addressValid}
				onClick={() => setOpenAddAddressModal(true)}
			>
				Watch Address
			</PrimaryButton>
		</Form>
	);
};

export default AddWatchlistAddress;
