import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import PaymentDetails from './PaymentDetails';
import ReviewDetails from './ReviewDetails';
import SelectContact from './SelectContact';
import SharePaymentRequest from './SharePaymentRequest';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { IInvoice, IMultisig, IOrganisation } from '@common/types/substrate';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { createInvoice } from '@sdk/polkasafe-sdk/src/invoices';
import { EInvoiceStatus, NotificationStatus } from '@common/enum/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { ArrowLeftCircle, ArrowRightCircle, CheckOutlined } from '@common/global-ui-components/Icons';
import './styles.css';

const SendInvoice = ({
	onCancel,
	onModalChange,
	setSentInvoices
}: {
	onCancel: () => void;
	onModalChange: (title: string) => void;
	setSentInvoices: React.Dispatch<React.SetStateAction<IInvoice[]>>;
}) => {
	const [user] = useUser();
	const [organisation] = useOrganisation();

	const [sendInvoiceStep, setSendInvoiceStep] = useState<number>(0);

	const [selectedOrg, setSelectedOrg] = useState<IOrganisation>(organisation || {} as IOrganisation);
	const [multisig, setMultisig] = useState<IMultisig>(organisation?.multisigs?.[0] || {} as IMultisig);
	const [amount, setAmount] = useState<string>('0');
	const [title, setTitle] = useState<string>('');
	const [note, setNote] = useState<string>('');
	const [contactAddresses, setContactAddresses] = useState<string[]>([]);

	const [invoiceId, setInvoiceId] = useState<string>('');

	const [loading, setLoading] = useState<boolean>(false);

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
					organisations={user?.organisations || []}
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
			component: <SelectContact organisation={selectedOrg || {} as IOrganisation} organisations={user?.organisations || []} setSelectedAddresses={setContactAddresses} />,
			description: 'Review the details of your organisation, these can be edited later as well',
			title: 'Select Contact to Receive Payment'
		}
	];

	useEffect(() => {
		onModalChange(steps[0].title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sendInvoice = async () => {
		if (!title || !amount || !selectedOrg || !multisig || !contactAddresses || !user) return;

		setLoading(true);

		const { data } = (await createInvoice({
			address: user.address,
			signature: user.signature,
			amount,
			fileURL: '',
			from: multisig.address,
			invoiceId,
			network: multisig.network,
			note,
			organisationId: selectedOrg.id || selectedOrg.id,
			status: EInvoiceStatus.PENDING,
			title,
			to: contactAddresses
		})) as { data: any};

		console.log('create data', data);
		if (data) {
			queueNotification({
				header: 'Invoice Sent!',
				status: NotificationStatus.SUCCESS
			});
			setSentInvoices((prev) => [...prev, data]);
			onCancel();
		}
		setLoading(false);
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={sendInvoiceStep === 2 ? 250 : undefined}
					noWaitMessage
					message={sendInvoiceStep === 2 ? 'Creating Invoice Request' : 'Sending Invoice'}
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
				<div className='flex w-full justify-between mt-5 gap-x-4'>
					<div className='w-full'>
						<Button
							variant={EButtonVariant.DANGER}
							disabled={loading}
							icon={sendInvoiceStep !== 0 && <ArrowLeftCircle className='text-sm' />}
							fullWidth
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
						</Button>
					</div>
				</div>
			</div>
		</Spin>
	);
};

export default SendInvoice;
