'use client';

import { PlusCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IInvoice } from '@common/types/substrate';
import Loader from '@common/global-ui-components/Loder';
import Modal from '@common/global-ui-components/Modal';
import Button from '@common/global-ui-components/Button';
import { SendMoneyIcon } from '@common/global-ui-components/Icons';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import SentInvoices from '@substrate/app/(Main)/invoices/components/SentInvoices';
import PersonalInfoForm from '@substrate/app/(Main)/invoices/components/PersonalInfoForm';
import SendInvoice from '@substrate/app/(Main)/invoices/components/SendInvoice';
import ReceivedInvoices from '@substrate/app/(Main)/invoices/components/ReceivedInvoices';
import { invoicesByOrganisation } from '@sdk/polkasafe-sdk/src/invoices';

enum ETab {
	SENT,
	RECEIVED
}

const Invoices = () => {
	const [tab, setTab] = useState(ETab.SENT);
	const [organisation] = useOrganisation();
    const [user] = useUser();

	const [loading, setLoading] = useState<boolean>(false);

	const [openPersonalInfoModal, setOpenPersonalInfoModal] = useState<boolean>(false);
	const [openSendInvoiceModal, setOpenSendInvoiceModal] = useState<boolean>(false);

	const [modalTitle, setModalTitle] = useState<string>('');

	const [sentInvoices, setSentInvoices] = useState<IInvoice[]>([]);
	const [userReceivedInvoices, setUserReceivedInvoices] = useState<IInvoice[]>([]);

	const [orgReceivedInvoices, setOrgReceivedInvoices] = useState<IInvoice[]>([]);

	useEffect(() => {
		const fetchInvoices = async () => {
			if (!organisation?.id || !user?.address) return;

			setLoading(true);

            const { data } = (await invoicesByOrganisation({
                address: user.address,
                signature: user.signature,
                organisationId: organisation.id,
            })) as { data: { orgReceivedInvoices: IInvoice[]; sentInvoices: IInvoice[]; userReceivedInvoices: IInvoice[] } };
    
            if (data) {
                console.log('invoices data', data);
                setSentInvoices(data.sentInvoices);
				setOrgReceivedInvoices(data.orgReceivedInvoices);
				setUserReceivedInvoices(data.userReceivedInvoices);
                setLoading(false);
            }
			setLoading(false);
		};
		fetchInvoices();
	}, [organisation?.id, user?.address]);

	return (
		<div className='h-[75vh] bg-bg-main rounded-lg px-5 py-3'>
			{loading ? (
				<Loader />
			) : (
				<>
					<Modal
						open={openPersonalInfoModal}
						onCancel={() => setOpenPersonalInfoModal(false)}
						title='Add Personal/Comapny Info'
					>
						<PersonalInfoForm onCancel={() => setOpenPersonalInfoModal(false)} />
					</Modal>
					<Modal
						open={openSendInvoiceModal}
						onCancel={() => setOpenSendInvoiceModal(false)}
						title={modalTitle}
					>
						<SendInvoice
							onModalChange={(title) => setModalTitle(title)}
							onCancel={() => setOpenSendInvoiceModal(false)}
							setSentInvoices={setSentInvoices}
						/>
					</Modal>
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
						<Button
							size='large'
							onClick={() => setOpenPersonalInfoModal(true)}
							icon={<PlusCircleOutlined className='text-white' />}
						>
							Add Personal Info
						</Button>
					</div>
					{tab === ETab.SENT ? (
						<SentInvoices
							invoices={sentInvoices.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))}
						/>
					) : (
						<ReceivedInvoices
                            userAddress={user?.address || ''}
							invoices={[...userReceivedInvoices, ...orgReceivedInvoices].sort((a, b) =>
								dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1
							)}
							setInvoices={setUserReceivedInvoices}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default Invoices;