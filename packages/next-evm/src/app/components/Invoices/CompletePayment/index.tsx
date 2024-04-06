import React, { useEffect, useState } from 'react';
import { ArrowLeftCircle, ArrowRightCircle, CheckOutlined } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { EINVOICE_STATUS, IMultisigAddress } from '@next-common/types';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useWallets } from '@privy-io/react-auth';
import CancelBtn from '../../Settings/CancelBtn';
import PaymentStep from './PaymentStep';
import ReviewPayment from './ReviewPayment';
import SendFundsForm from '../../SendFunds/SendFundsForm';

const CompleteInvoicePayment = ({
	onCancel,
	onModalChange,
	requestedAmount,
	receiverAddress,
	status,
	invoiceId
}: {
	onCancel: () => void;
	onModalChange: (title: string) => void;
	requestedAmount: string;
	receiverAddress: string;
	status: EINVOICE_STATUS;
	invoiceId: string;
}) => {
	const { activeOrg } = useActiveOrgContext();
	const { activeMultisig } = useGlobalUserDetailsContext();
	const activeMultisigData = activeOrg.multisigs.find(
		(item) => item.address === activeMultisig || item.proxy === activeMultisig
	);

	const [sendInvoiceStep, setSendInvoiceStep] = useState<number>(0);
	const [multisig, setMultisig] = useState<IMultisigAddress>(activeMultisigData || activeOrg?.multisigs?.[0]);
	const [amount, setAmount] = useState<string>('0');

	const [loading] = useState<boolean>(false);

	const [approveLoading, setApproveLoading] = useState<boolean>(false);

	const [invoiceStatus, setInvoiceStatus] = useState<EINVOICE_STATUS>(status);

	const [rejectConfirmationModal, setRejectConfirmationModal] = useState<boolean>(false);

	const { wallets } = useWallets();
	const connectedWallet = wallets[0];

	useEffect(() => {
		if (activeOrg && activeOrg.multisigs) {
			setMultisig(activeOrg.multisigs[0]);
		}
	}, [activeOrg]);

	const steps = [
		{
			component: (
				<PaymentStep
					amount={amount}
					setAmount={setAmount}
					multisig={multisig}
					setMultisig={setMultisig}
					receiverAddress={receiverAddress}
					requestedAmount={requestedAmount}
				/>
			),
			description: 'Give details about your organisation to help customise experience better',
			title: 'Complete Payment'
		},
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
				<SendFundsForm
					onCancel={onCancel}
					defaultSelectedAddress={receiverAddress}
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
		if (!invoiceId || !s || !connectedWallet) return;

		setApproveLoading(true);

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateInvoice_eth`, {
			body: JSON.stringify({
				invoiceId,
				status: s
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (!invoiceError && invoiceData) {
			setInvoiceStatus(s);
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
					{sendInvoiceStep !== 2 && (
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
								disabled={
									sendInvoiceStep === 0 &&
									(!amount || Number.isNaN(Number(amount)) || Number(amount) === 0 || !multisig || !activeOrg)
								}
								icon={sendInvoiceStep === 1 && <CheckOutlined className='text-sm' />}
								onClick={() => {
									setSendInvoiceStep((prev) => prev + 1);
									onModalChange(steps[sendInvoiceStep + 1]?.title || '');
								}}
								className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
								size='large'
							>
								{sendInvoiceStep === 1 ? 'Confirm' : 'Next'}
								{sendInvoiceStep !== 1 && <ArrowRightCircle className='text-sm' />}
							</PrimaryButton>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CompleteInvoicePayment;
