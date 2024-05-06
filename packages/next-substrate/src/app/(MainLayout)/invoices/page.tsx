'use client';

/* eslint-disable sonarjs/no-duplicate-string */
import { PlusCircleOutlined } from '@ant-design/icons';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { IInvoice, NotificationStatus } from '@next-common/types';
import { SendMoneyIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';
import PersonalInfoForm from '@next-substrate/app/components/Invoices/PersonalInfoForm';
import ReceivedInvoices from '@next-substrate/app/components/Invoices/ReceivedInvoices';
import SendInvoice from '@next-substrate/app/components/Invoices/SendInvoice';
import SentInvoices from '@next-substrate/app/components/Invoices/SentInvoices';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';

enum ETab {
	SENT,
	RECEIVED
}

const Invoices = () => {
	const [tab, setTab] = useState(ETab.SENT);
	const { activeOrg } = useActiveOrgContext();
	const { address } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);

	const [openPersonalInfoModal, setOpenPersonalInfoModal] = useState<boolean>(false);
	const [openSendInvoiceModal, setOpenSendInvoiceModal] = useState<boolean>(false);

	const [modalTitle, setModalTitle] = useState<string>('');

	const [sentInvoices, setSentInvoices] = useState<IInvoice[]>([]);
	const [userReceivedInvoices, setUserReceivedInvoices] = useState<IInvoice[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [orgReceivedInvoices, setOrgReceivedInvoices] = useState<IInvoice[]>([]);

	useEffect(() => {
		const fetchInvoices = async () => {
			if (!activeOrg || !activeOrg.id || !address) return;

			setLoading(true);

			const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getInvoices_substrate`, {
				body: JSON.stringify({
					organisationId: activeOrg.id
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
				data: { orgReceivedInvoices: IInvoice[]; sentInvoices: IInvoice[]; userReceivedInvoices: IInvoice[] };
				error: string;
			};
			if (invoiceError) {
				queueNotification({
					header: 'Error in Fetching Invoices!',
					message: invoiceError,
					status: NotificationStatus.ERROR
				});
			}
			if (invoiceData && !invoiceError) {
				setSentInvoices(invoiceData.sentInvoices);
				setOrgReceivedInvoices(invoiceData.orgReceivedInvoices);
				setUserReceivedInvoices(invoiceData.userReceivedInvoices);
				console.log('invoice data', invoiceData, invoiceError);
			}
			setLoading(false);
		};
		fetchInvoices();
	}, [activeOrg, address]);

	return (
		<div className='h-[75vh] bg-bg-main rounded-lg px-5 py-3'>
			{loading ? (
				<Loader />
			) : (
				<>
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
							setSentInvoices={setSentInvoices}
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
					{tab === ETab.SENT ? (
						<SentInvoices invoices={sentInvoices} />
					) : (
						<ReceivedInvoices
							invoices={userReceivedInvoices}
							setInvoices={setUserReceivedInvoices}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default Invoices;
