import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import Modal from '@common/global-ui-components/Modal';
import React from 'react';

interface IConfirmationModal {
	openModal: boolean;
	setOpenModal: (value: boolean) => void;
	title: string;
	message: string;
	onSubmit: () => void;
}

export const ConfirmationModal = ({ openModal, setOpenModal, title, message, onSubmit }: IConfirmationModal) => {
	return (
		<Modal
			open={openModal}
			onCancel={() => setOpenModal(false)}
			title={title}
		>
			<div className='flex flex-col gap-5'>{message}</div>
			<div className='mt-6 flex justify-end gap-4'>
				<Button
					variant={EButtonVariant.PRIMARY}
					onClick={() => {
						onSubmit();
						setOpenModal(false);
					}}
				>
					Yes
				</Button>
				<Button
					variant={EButtonVariant.DANGER}
					onClick={() => setOpenModal(false)}
					icon={<OutlineCloseIcon className='text-failure' />}
				>
					No
				</Button>
			</div>
		</Modal>
	);
};
