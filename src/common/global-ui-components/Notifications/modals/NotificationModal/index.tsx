import { PlusCircleOutlined } from '@ant-design/icons';
import { ECHANNEL } from '@common/enum/substrate';
import Modal from '@common/global-ui-components/Modal';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { PropsWithChildren, useState } from 'react';

export const NotificationModal = ({ channel, children }: PropsWithChildren<{ channel?: ECHANNEL }>) => {
	const [openModal, setOpenModal] = useState(false);
	return (
		<>
			<span onClick={() => setOpenModal(true)}>
				<Typography
					variant={ETypographyVariants.p}
					className='text-primary flex items-center font-bold justify-center gap-1 cursor-pointer'
				>
					<PlusCircleOutlined className='text-primary' /> ADD THE PSAFE BOT
				</Typography>
			</span>
			<Modal
				open={openModal}
				onCancel={() => {
					setOpenModal(false);
				}}
				title={
					<Typography
						variant={ETypographyVariants.p}
						className='capitalize text-white text-lg'
					>
						{channel || 'Notification'} {channel ? 'Notifications' : 'Settings'}
					</Typography>
				}
			>
				{children}
			</Modal>
		</>
	);
};
