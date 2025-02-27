
import dayjs from 'dayjs';
import React, { useState } from 'react';
import CompleteInvoicePayment from '../CompletePayment';
import { EInvoiceStatus, ENetwork } from '@common/enum/substrate';
import { IInvoice } from '@common/types/substrate';
import Modal from '@common/global-ui-components/Modal';
import Address from '@common/global-ui-components/Address';
import { RightArrowOutlined } from '@common/global-ui-components/Icons';

const SingleInv = ({
	created_at,
	id,
	from,
	amount,
	status,
	network,
	invoiceId,
	to,
	setInvoices,
	userAddress
}: {
	created_at: string;
	id: number;
	invoiceId: string;
	from: string;
	amount: string;
	status: EInvoiceStatus;
	network: string;
	transactionHash: string;
	to: string[];
	setInvoices: React.Dispatch<React.SetStateAction<IInvoice[]>>;
	userAddress: string;
}) => {
	const [openPaymentModal, setOpenPaymentModal] = useState(false);
	const [modalTitle, setModalTitle] = useState<string>('');

	return (
		<div className='border-b border-text_secondary py-4 px-4 grid items-center grid-cols-7 gap-x-5 text-white font-normal text-sm leading-[15px]'>
			<Modal
				title={modalTitle}
				onCancel={() => setOpenPaymentModal(false)}
				open={openPaymentModal}
			>
				<CompleteInvoicePayment
					onModalChange={(title) => setModalTitle(title)}
					onCancel={() => setOpenPaymentModal(false)}
					receiverAddress={from}
					requestedAmount={amount}
					status={status as EInvoiceStatus}
					invoiceId={invoiceId}
					setInvoices={setInvoices}
					invoiceIndex={id}
					requestedNetwork={network}
					to={to}
					approvingAddress={userAddress}
				/>
			</Modal>
			<p className='col-span-1'>{dayjs(created_at).format('lll')}</p>
			<p className='col-span-1'># {id + 1}</p>
			<p className='col-span-2'>
				<Address network={network as ENetwork} address={from} />
			</p>
			<p className='col-span-1'>Not Paid</p>
			<p className='col-span-1'>$ {amount}</p>
			<p className='col-span-1 flex justify-between items-center'>
				<span className='text-waiting capitalize'>{status}</span>
				<span
					className='text-lg text-primary cursor-pointer'
					onClick={() => {
						setOpenPaymentModal(true);
					}}
				>
					<RightArrowOutlined />
				</span>
			</p>
		</div>
	);
};

export default SingleInv;
