import React, { useEffect, useState } from 'react';
import { ArrowLeftCircle, ArrowRightCircle } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { EINVOICE_STATUS, IInvoice, NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import queueNotification from '@next-common/ui-components/QueueNotification';
import CancelBtn from '../../Settings/CancelBtn';
import ReviewPayment from './ReviewPayment';
import PayInvoice from '../PayInvoice';

const CompleteInvoicePayment = ({
	onCancel,
	onModalChange,
	requestedAmount,
	receiverAddress,
	status,
	invoiceId,
	setInvoices,
	invoiceIndex,
	requestedNetwork,
	to,
	approvingAddress
}: {
	onCancel: () => void;
	onModalChange: (title: string) => void;
	requestedAmount: string;
	receiverAddress: string;
	status: EINVOICE_STATUS;
	invoiceId: string;
	setInvoices?: React.Dispatch<React.SetStateAction<IInvoice[]>>;
	invoiceIndex?: number;
	requestedNetwork: string;
	to?: string[];
	approvingAddress: string;
}) => {
	const [sendInvoiceStep, setSendInvoiceStep] = useState<number>(0);

	const [loading] = useState<boolean>(false);

	const [approveLoading, setApproveLoading] = useState<boolean>(false);

	const [invoiceStatus, setInvoiceStatus] = useState<EINVOICE_STATUS>(status);

	const [rejectConfirmationModal, setRejectConfirmationModal] = useState<boolean>(false);

	const steps = [
		{
			component: (
				<ReviewPayment
					receiverAddress={receiverAddress}
					amount={requestedAmount}
				/>
			),
			description: 'Add members to your organisation by creating or linking multisig(s)',
			title: 'Review your Payment'
		},
		{
			component: (
				<PayInvoice
					invoiceId={invoiceId}
					onCancel={onCancel}
					receiverAddress={receiverAddress}
					requestedAmount={requestedAmount}
					requestedNetwork={requestedNetwork}
				/>
			),
			description: '',
			title: 'Send Funds'
		}
	];

	useEffect(() => {
		onModalChange(steps[0].title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const updateInvoiceStatus = async (s: EINVOICE_STATUS) => {
		if (!invoiceId || !s) return;

		if (to && to.length > 0 && !to.includes(approvingAddress)) {
			queueNotification({
				header: 'Error!',
				message: 'This Invoice was not Received by your Address',
				status: NotificationStatus.ERROR
			});
			return;
		}

		setApproveLoading(true);

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_substrate`, {
			body: JSON.stringify({
				invoiceId,
				status: s
			}),
			headers: firebaseFunctionsHeader(),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (!invoiceError && invoiceData) {
			setInvoiceStatus(s);
			setInvoices?.((prev) => {
				const copyArray = [...prev];
				const copyObject = { ...copyArray[invoiceIndex] };
				copyObject.status.current_status = s;
				return copyArray;
			});
		}
		setApproveLoading(false);
	};

	return (
		<div>
			{invoiceStatus === EINVOICE_STATUS.PENDING ? (
				<div>
					<ModalComponent
						title=''
						onCancel={() => setRejectConfirmationModal(false)}
						open={rejectConfirmationModal}
					>
						<div>
							<p className='text-sm text-white'>Are you sure you want to Reject this Invoice?</p>
							<div className='flex w-full justify-between mt-5'>
								<CancelBtn
									disabled={approveLoading}
									title='Cancel'
									onClick={() => {
										setRejectConfirmationModal(false);
									}}
								/>
								<PrimaryButton
									loading={approveLoading}
									onClick={() => {
										updateInvoiceStatus(EINVOICE_STATUS.REJECTED);
										onCancel();
										setRejectConfirmationModal(false);
									}}
									className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
									size='large'
								>
									Yes, Reject
									<ArrowRightCircle className='text-sm' />
								</PrimaryButton>
							</div>
						</div>
					</ModalComponent>
					<div className='rounded-xl bg-bg-secondary p-2 mb-3'>
						<p className='font-bold text-sm mb-2 text-white'>Receiver Details:</p>
						<div className='border border-text_placeholder rounded-xl p-3 flex items-center justify-between'>
							<AddressComponent
								address={receiverAddress}
								// network={network}
								isMultisig
								withBadge={false}
							/>
							<div className='rounded-lg bg-bg-main px-2 py-1 flex justify-between items-center text-white'>
								{requestedAmount} USD
							</div>
						</div>
					</div>
					<p className='mt-3 text-white text-sm flex justify-center'>
						Please Approve or Reject this Request before proceeding further.
					</p>
					<div className='flex w-full justify-center gap-x-3 mt-5'>
						<CancelBtn
							disabled={approveLoading}
							title='Reject'
							onClick={() => {
								setRejectConfirmationModal(true);
							}}
						/>
						<PrimaryButton
							loading={approveLoading}
							onClick={() => {
								updateInvoiceStatus(EINVOICE_STATUS.APPROVED);
							}}
							className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
							size='large'
						>
							Approve
							<ArrowRightCircle className='text-sm' />
						</PrimaryButton>
					</div>
				</div>
			) : (
				<>
					{steps.map((item, i) =>
						i === sendInvoiceStep ? (
							<div>
								{/* <p className='text-sm text-text_secondary mb-5'>{item.description}</p> */}
								{item.component}
							</div>
						) : null
					)}
					{sendInvoiceStep !== 1 && (
						<div className='flex w-full justify-between mt-5'>
							<CancelBtn
								disabled={loading}
								title={sendInvoiceStep === 0 ? 'Cancel' : 'Back'}
								icon={sendInvoiceStep !== 0 && <ArrowLeftCircle className='text-sm' />}
								onClick={() => {
									if (sendInvoiceStep === 0) {
										onCancel();
										return;
									}
									onModalChange(steps[sendInvoiceStep - 1]?.title || '');
									setSendInvoiceStep((prev) => prev - 1);
								}}
							/>
							<PrimaryButton
								loading={loading}
								onClick={() => {
									setSendInvoiceStep((prev) => prev + 1);
									onModalChange(steps[sendInvoiceStep + 1]?.title || '');
								}}
								className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
								size='large'
							>
								Pay Now
								<ArrowRightCircle className='text-sm' />
							</PrimaryButton>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CompleteInvoicePayment;
