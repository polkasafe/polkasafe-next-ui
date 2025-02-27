'use client';

import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { useState } from 'react';
import Modal from '@common/global-ui-components/Modal';
import { IAddressBook } from '@common/types/substrate';
import { twMerge } from 'tailwind-merge';
import { AddAddressForm } from '@common/modals/AddressBook/AddAddress/components/AddAddressForm';
import { EditIcon } from '@common/global-ui-components/Icons';
import { PlusCircleOutlined } from '@ant-design/icons';

interface IAddAddress {
	title: string;
	addressBook: IAddressBook;
	className?: string;
	isUsedInsideTable?: boolean;
	onSubmit: (values: IAddressBook) => Promise<void>;
}

export const AddAddress = ({ onSubmit, title, addressBook, className, isUsedInsideTable }: IAddAddress) => {
	const [openModal, setOpenModal] = useState(false);
	return (
		<div className={twMerge('', className)}>
			{isUsedInsideTable ? (
				<Button
					size='small'
					variant={EButtonVariant.SECONDARY}
					onClick={() => setOpenModal(true)}
					className='bg-highlight p-2.5 rounded-lg border-none min-w-0'
				>
					<EditIcon className='text-primary' />
				</Button>
			) : (
				<Button
					variant={EButtonVariant.PRIMARY}
					icon={<PlusCircleOutlined />}
					onClick={() => setOpenModal(true)}
					size='large'
				>
					{title}
				</Button>
			)}

			<Modal
				open={openModal}
				onCancel={() => setOpenModal(false)}
				title={`${title} Address`}
			>
				<AddAddressForm
					initialValue={{
						address: addressBook.address,
						name: addressBook.name,
						email: addressBook.email === '-' ? '' : addressBook.email,
						discord: addressBook.discord === '-' ? '' : addressBook.discord,
						telegram: addressBook.telegram === '-' ? '' : addressBook.telegram
					}}
					onSubmit={async (values: IAddressBook) => {
						await onSubmit(values);
						setOpenModal(false);
					}}
				/>
			</Modal>
		</div>
	);
};
