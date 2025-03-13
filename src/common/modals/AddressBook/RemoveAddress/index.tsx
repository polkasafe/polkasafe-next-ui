import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import React, { useState } from 'react';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { ConfirmationModal } from '@common/modals/ConfirmationModal';
import { DeleteIcon } from '@common/global-ui-components/Icons';
import { useNotification } from '@common/utils/notification';

export const RemoveAddress = ({ onSubmit }: { onSubmit: () => Promise<void> }) => {
	const [openModal, setOpenModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const notification = useNotification();
	const handleRemove = async () => {
		try {
			setLoading(true);
			await onSubmit();
			notification(SUCCESS_MESSAGES.REMOVE_ADDRESS_SUCCESS);
		} catch (error) {
			console.error(error);
			notification({ ...ERROR_MESSAGES.REMOVE_ADDRESS_FAILED, description: error.message || error });
		} finally {
			setLoading(false);
			setOpenModal(false);
		}
	};
	return (
		<>
			<Button
				size='small'
				variant={EButtonVariant.SECONDARY}
				onClick={() => setOpenModal(true)}
				loading={loading}
				className='bg bg-[#e63946]/[0.1] p-2.5 rounded-lg text-failure border-none min-w-0'
			>
				<DeleteIcon />
			</Button>
			<ConfirmationModal
				openModal={openModal}
				setOpenModal={setOpenModal}
				title='Delete Address'
				message='Are you sure you want to delete this address from address book'
				onSubmit={handleRemove}
			/>
		</>
	);
};
