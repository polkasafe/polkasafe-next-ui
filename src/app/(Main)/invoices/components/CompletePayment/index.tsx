import React, { useEffect, useState } from 'react';
import ReviewPayment from './ReviewPayment';
import PayInvoice from '../PayInvoice';
import { EInvoiceStatus, NotificationStatus } from '@common/enum/substrate';
import { IInvoice } from '@common/types/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { updateInvoice } from '@sdk/polkasafe-sdk/src/invoices';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import Modal from '@common/global-ui-components/Modal';
import { ActionButtons } from '@common/global-ui-components/ActionButtons';
import Address from '@common/global-ui-components/Address';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { ArrowLeftCircle, ArrowRightCircle } from '@common/global-ui-components/Icons';

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
	status: EInvoiceStatus;
	invoiceId: string;
	setInvoices?: React.Dispatch<React.SetStateAction<IInvoice[]>>;
	invoiceIndex?: number;
	requestedNetwork: string;
	to?: string[];
	approvingAddress: string;
}) => {
	const [user] = useUser();
	const [sendInvoiceStep, setSendInvoiceStep] = useState<number>(0);

	const [loading] = useState<boolean>(false);

	const [approveLoading, setApproveLoading] = useState<boolean>(false);

	const [invoiceStatus, setInvoiceStatus] = useState<EInvoiceStatus>(status);

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
		}
		// {
		// 	component: (
		// 		<PayInvoice
		// 			invoiceId={invoiceId}
		// 			onCancel={onCancel}
		// 			receiverAddress={receiverAddress}
		// 			requestedAmount={requestedAmount}
		// 			requestedNetwork={requestedNetwork}
		// 		/>
		// 	),
		// 	description: '',
		// 	title: 'Send Funds'
		// }
	];

	useEffect(() => {
		onModalChange(steps[0].title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const updateInvoiceStatus = async (s: EInvoiceStatus) => {
		if (!user) return;
		console.log('on approve', invoiceId, s);
		if (!invoiceId || !s) return;

		console.log('to', to, approvingAddress);
		if (to && to.length > 0 && !to.includes(approvingAddress)) {
			queueNotification({
				header: 'Error!',
				message: 'This Invoice was not Received by your Address',
				status: NotificationStatus.ERROR
			});
			return;
		}

		setApproveLoading(true);

		const { data } = (await updateInvoice({
			address: user.address,
			signature: user.signature,
			invoiceId,
			status: s
		})) as { data: any };

		if (data) {
			setInvoiceStatus(s);
			setInvoices?.((prev) => {
				const copyArray = [...prev];
				const copyObject = { ...copyArray[invoiceIndex || 0] };
				copyObject.status.current_status = s;
				return copyArray;
			});
		}
		setApproveLoading(false);
	};

	return (
		<div>
			{invoiceStatus === EInvoiceStatus.PENDING ? (
				<div>
					<Modal
						title=''
						onCancel={() => setRejectConfirmationModal(false)}
						open={rejectConfirmationModal}
					>
						<div>
							<p className='text-sm text-white'>Are you sure you want to Reject this Invoice?</p>
							<div className='flex w-full justify-between mt-5'>
								<ActionButtons disabled={approveLoading} onCancel={() => {
										setRejectConfirmationModal(false);
									}} onClick={() => {
										updateInvoiceStatus(EInvoiceStatus.REJECTED);
										onCancel();
										setRejectConfirmationModal(false);
									}} label={'Yes, Reject'} />
							</div>
						</div>
					</Modal>
					<div className='rounded-xl bg-bg-secondary p-2 mb-3'>
						<p className='font-bold text-sm mb-2 text-white'>Receiver Details:</p>
						<div className='border border-text_placeholder rounded-xl p-3 flex items-center justify-between'>
							<Address
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
						<ActionButtons disabled={approveLoading} onCancel={() => {
							setRejectConfirmationModal(true);
						}} onClick={() => {
							updateInvoiceStatus(EInvoiceStatus.APPROVED);
						}} label={'Approve'} loading={approveLoading}  />
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
						<div className='flex w-full justify-between mt-5 gap-x-4'>
							<div className='w-full'>
								<Button
									variant={EButtonVariant.DANGER}
									disabled={loading}
									fullWidth
									icon={sendInvoiceStep !== 0 && <ArrowLeftCircle className='text-sm' />}
									onClick={() => {
										if (sendInvoiceStep === 0) {
											onCancel();
											return;
										}
										onModalChange(steps[sendInvoiceStep - 1]?.title || '');
										setSendInvoiceStep((prev) => prev - 1);
									}}
								>
									{sendInvoiceStep === 0 ? 'Cancel' : 'Back'}
								</Button>
							</div>
							<div className='w-full'>
								<Button
									htmlType='submit'
									variant={EButtonVariant.PRIMARY}
									loading={loading}
									fullWidth
									onClick={() => {
										setSendInvoiceStep((prev) => prev + 1);
										onModalChange(steps[sendInvoiceStep + 1]?.title || '');
									}}
									className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
									size='large'
								>
									Pay Now
									<ArrowRightCircle className='text-sm' />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CompleteInvoicePayment;
