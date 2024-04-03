'use client';

/* eslint-disable sonarjs/no-duplicate-string */
import { PlusCircleOutlined } from '@ant-design/icons';
import { SendMoneyIcon } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import PersonalInfoForm from '@next-evm/app/components/Invoices/PersonalInfoForm';
import ReceivedInvoices from '@next-evm/app/components/Invoices/ReceivedInvoices';
import SendInvoice from '@next-evm/app/components/Invoices/SendInvoice';
import SentInvoices from '@next-evm/app/components/Invoices/SentInvoices';
import { Button } from 'antd';
import React, { useState } from 'react';

enum ETab {
	SENT,
	RECEIVED
}

const Invoices = () => {
	const [tab, setTab] = useState(ETab.SENT);

	const [openPersonalInfoModal, setOpenPersonalInfoModal] = useState<boolean>(false);
	const [openSendInvoiceModal, setOpenSendInvoiceModal] = useState<boolean>(false);

	const [modalTitle, setModalTitle] = useState<string>('');

	return (
		<div className='h-[75vh] bg-bg-main rounded-lg px-5 py-3'>
			<ModalComponent
				open={openPersonalInfoModal}
				onCancel={() => setOpenPersonalInfoModal(false)}
				title='Add Personal/Comapny Info'
			>
				<PersonalInfoForm onCancel={() => setOpenPersonalInfoModal(false)} />
			</ModalComponent>
			<ModalComponent
				open={openSendInvoiceModal}
				onCancel={() => setOpenSendInvoiceModal(false)}
				title={modalTitle}
			>
				<SendInvoice
					onModalChange={(title) => setModalTitle(title)}
					onCancel={() => setOpenSendInvoiceModal(false)}
				/>
			</ModalComponent>
			<div className='flex items-center gap-x-3 mb-4 scale-90 w-[111%] origin-top-left'>
				{/* <Button
					onClick={() => setTab(ETab.ALL)}
					// icon={<QueueIcon />}
					size='large'
					className={`font-medium text-sm leading-[15px] w-[70px] text-white outline-none border-none ${
						tab === ETab.ALL && 'text-primary bg-highlight'
					}`}
				>
					All
				</Button> */}
				<Button
					onClick={() => setTab(ETab.SENT)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] text-white outline-none border-none ${
						tab === ETab.SENT && 'text-primary bg-highlight'
					}`}
				>
					Sent (Requested)
				</Button>
				<Button
					onClick={() => setTab(ETab.RECEIVED)}
					// icon={<HistoryIcon />}
					size='large'
					className={`rounded-lg font-medium text-sm leading-[15px] text-white outline-none border-none ${
						tab === ETab.RECEIVED && 'text-primary bg-highlight'
					}`}
				>
					Received Invoices
				</Button>
				<div className='flex-1' />
				<Button
					onClick={() => setOpenSendInvoiceModal(true)}
					size='large'
					icon={<SendMoneyIcon />}
					className='text-primary bg-highlight outline-none border-none font-medium text-sm'
				>
					Send Invoice
				</Button>
				<PrimaryButton
					size='large'
					onClick={() => setOpenPersonalInfoModal(true)}
					icon={<PlusCircleOutlined className='text-white' />}
				>
					Add Personal Info
				</PrimaryButton>
			</div>
			{tab === ETab.SENT ? <SentInvoices /> : <ReceivedInvoices />}
		</div>
	);
};

export default Invoices;
