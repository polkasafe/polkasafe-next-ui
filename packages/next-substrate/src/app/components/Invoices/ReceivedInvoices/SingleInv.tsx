import { RightArrowOutlined } from '@next-common/ui-components/CustomIcons';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { EINVOICE_STATUS, IInvoice } from '@next-common/types';
import formatBalance from '@next-substrate/utils/formatBalance';
import { chainProperties } from '@next-common/global/networkConstants';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import CompleteInvoicePayment from '../CompletePayment';

const SingleInv = ({
	created_at,
	id,
	from,
	amount,
	status,
	network,
	transactionHash,
	invoiceId,
	to,
	setInvoices
}: {
	created_at: string;
	id: number;
	invoiceId: string;
	from: string;
	amount: string;
	status: EINVOICE_STATUS;
	network: string;
	transactionHash: string;
	to: string[];
	setInvoices: React.Dispatch<React.SetStateAction<IInvoice[]>>;
}) => {
	const [openPaymentModal, setOpenPaymentModal] = useState(false);
	const [modalTitle, setModalTitle] = useState<string>('');

	const { address } = useGlobalUserDetailsContext();

	useEffect(() => {
		console.log('network', network, transactionHash);
		if (!network || !transactionHash) return;
		const fetchTxnDetails = async () => {
			const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), transactionHash);
			console.log('txDetails', txDetails);
		};
		fetchTxnDetails();
	}, [network, transactionHash]);

	return (
		<div className='border-b border-text_secondary py-4 px-4 grid items-center grid-cols-7 gap-x-5 text-white font-normal text-sm leading-[15px]'>
			<ModalComponent
				title={modalTitle}
				onCancel={() => setOpenPaymentModal(false)}
				open={openPaymentModal}
			>
				<CompleteInvoicePayment
					onModalChange={(title) => setModalTitle(title)}
					onCancel={() => setOpenPaymentModal(false)}
					receiverAddress={from}
					requestedAmount={amount}
					status={status as EINVOICE_STATUS}
					invoiceId={invoiceId}
					setInvoices={setInvoices}
					invoiceIndex={id}
					requestedNetwork={network}
					to={to}
					approvingAddress={address}
				/>
			</ModalComponent>
			<p className='col-span-1'>{dayjs(created_at).format('lll')}</p>
			<p className='col-span-1'># {id + 1}</p>
			<p className='col-span-2'>
				<AddressComponent address={from} />
			</p>
			<p className='col-span-1'>Not Paid</p>
			<p className='col-span-1'>$ {formatBalance(amount)}</p>
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
