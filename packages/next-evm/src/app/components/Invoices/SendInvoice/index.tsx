import React, { useEffect, useState } from 'react';
import { ArrowLeftCircle, ArrowRightCircle, CheckOutlined } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { EINVOICE_STATUS, IInvoice, IMultisigAddress, IOrganisation, NotificationStatus } from '@next-common/types';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { Spin } from 'antd';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import { useWallets } from '@privy-io/react-auth';
import CancelBtn from '../../Settings/CancelBtn';
import PaymentDetails from './PaymentDetails';
import ReviewDetails from './ReviewDetails';
import SelectContact from './SelectContact';
import SharePaymentRequest from './SharePaymentRequest';

const SendInvoice = ({
	onCancel,
	onModalChange,
	setSentInvoices
}: {
	onCancel: () => void;
	onModalChange: (title: string) => void;
	setSentInvoices: React.Dispatch<React.SetStateAction<IInvoice[]>>;
}) => {
	const { activeOrg } = useActiveOrgContext();
	const { activeMultisig } = useGlobalUserDetailsContext();
	const activeMultisigData = activeOrg.multisigs.find(
		(item) => item.address === activeMultisig || item.proxy === activeMultisig
	);

	const [sendInvoiceStep, setSendInvoiceStep] = useState<number>(0);

	const [selectedOrg, setSelectedOrg] = useState<IOrganisation>(activeOrg);
	const [multisig, setMultisig] = useState<IMultisigAddress>(activeMultisigData || activeOrg?.multisigs?.[0]);
	const [amount, setAmount] = useState<string>('0');
	const [title, setTitle] = useState<string>('');
	const [note, setNote] = useState<string>('');
	const [contactAddresses, setContactAddresses] = useState<string[]>([]);

	const [invoiceId, setInvoiceId] = useState<string>('');

	const [loading, setLoading] = useState<boolean>(false);

	const { wallets } = useWallets();
	const connectedWallet = wallets[0];

	useEffect(() => {
		if (selectedOrg && selectedOrg.multisigs) {
			setMultisig(selectedOrg.multisigs[0]);
		}
	}, [selectedOrg]);

	const steps = [
		{
			component: (
				<PaymentDetails
					selectedOrg={selectedOrg}
					setSelectedOrg={setSelectedOrg}
					multisig={multisig}
					setMultisig={setMultisig}
					amount={amount}
					setAmount={setAmount}
					title={title}
					setTitle={setTitle}
					note={note}
					setNote={setNote}
				/>
			),
			description: 'Give details about your organisation to help customise experience better',
			title: 'Send Payment Request'
		},
		{
			component: (
				<ReviewDetails
					multisig={multisig}
					selectedOrg={selectedOrg}
					amount={amount}
				/>
			),
			description: 'Add members to your organisation by creating or linking multisig(s)',
			title: 'Review your Payment Request'
		},
		{
			component: (
				<SharePaymentRequest
					invoiceId={invoiceId}
					setInvoiceId={setInvoiceId}
					setStep={setSendInvoiceStep}
				/>
			),
			description: 'Review the details of your organisation, these can be edited later as well',
			title: 'Share your Payment Request'
		},
		{
			component: <SelectContact setSelectedAddresses={setContactAddresses} />,
			description: 'Review the details of your organisation, these can be edited later as well',
			title: 'Select Contact to Receive Payment'
		}
	];

	useEffect(() => {
		onModalChange(steps[0].title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sendInvoice = async () => {
		if (!title || !amount || !activeOrg || !contactAddresses || !connectedWallet) return;

		setLoading(true);

		const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createInvoice_eth`, {
			body: JSON.stringify({
				amount,
				fileURL: '',
				from: multisig.address || activeMultisig,
				invoiceId,
				network: multisig.network,
				note,
				organisationId: selectedOrg.id || activeOrg.id,
				status: EINVOICE_STATUS.PENDING,
				title,
				to: contactAddresses
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: invoiceData, error: invoiceError } = (await createInvoiceRes.json()) as {
			data: any;
			error: string;
		};
		if (invoiceError) {
			queueNotification({
				header: 'Error in Sending Invoice!',
				message: invoiceError,
				status: NotificationStatus.ERROR
			});
		}
		if (invoiceData && !invoiceError) {
			queueNotification({
				header: 'Invoice Sent!',
				status: NotificationStatus.SUCCESS
			});
			setSentInvoices((prev) => [...prev, invoiceData]);
			onCancel();
		}
		setLoading(false);
		console.log('invoice data', invoiceData, invoiceError);
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={sendInvoiceStep === 2 && 250}
					noWaitMessage
					message='Sending Invoice'
				/>
			}
		>
			<div>
				{steps.map((item, i) =>
					i === sendInvoiceStep ? (
						<div>
							{/* <p className='text-sm text-text_secondary mb-5'>{item.description}</p> */}
							{item.component}
						</div>
					) : null
				)}
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
							(sendInvoiceStep === 0 &&
								(!title ||
									!amount ||
									Number.isNaN(Number(amount)) ||
									Number(amount) === 0 ||
									!multisig ||
									!selectedOrg)) ||
							(sendInvoiceStep === 3 && contactAddresses.length === 0)
						}
						icon={sendInvoiceStep > 1 && <CheckOutlined className='text-sm' />}
						onClick={() => {
							if (sendInvoiceStep > 1) {
								sendInvoice();
								return;
							}

							setSendInvoiceStep((prev) => prev + 1);
							onModalChange(steps[sendInvoiceStep + 1]?.title || '');
						}}
						className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
						size='large'
					>
						{sendInvoiceStep > 1 ? 'Done' : 'Next'}
						{sendInvoiceStep < 2 && <ArrowRightCircle className='text-sm' />}
					</PrimaryButton>
				</div>
			</div>
		</Spin>
	);
};

export default SendInvoice;
