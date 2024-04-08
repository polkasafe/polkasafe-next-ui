import Image from 'next/image';
import React from 'react';
import receivedInvoiceImage from '@next-common/assets/ReceivedInvoice.png';
import { EINVOICE_STATUS, IInvoice } from '@next-common/types';
import { NETWORK } from '@next-common/global/evm-network-constants';
import SingleInv from './SingleInv';

const ReceivedInvoices = ({
	invoices,
	setInvoices
}: {
	invoices: IInvoice[];
	setInvoices: React.Dispatch<React.SetStateAction<IInvoice[]>>;
}) => {
	console.log('create at', invoices);
	return (
		<div className='scale-90 h-[111%] w-[111%] origin-top-left'>
			<article className='grid grid-cols-7 gap-x-5 bg-bg-secondary text-text_secondary py-4 px-4 rounded-lg text-sm mb-2'>
				<span className='col-span-1'>Creation Date</span>
				<span className='col-span-1'>Invoice #</span>
				<span className='col-span-2'>Requested By</span>
				<span className='col-span-1'>Paid From Wallet</span>
				<span className='col-span-1'>Amount</span>
				<span className='col-span-1'>Status</span>
			</article>
			{invoices?.length === 0 ? (
				<div className='w-full flex items-center flex-col mt-10 gap-y-2'>
					<Image
						src={receivedInvoiceImage}
						alt='sent invoice'
					/>
					<span className='text-sm text-text_secondary'>No Invoices Received</span>
				</div>
			) : (
				invoices.map((item, i) => (
					<SingleInv
						key={i}
						created_at={item.created_at}
						id={i}
						status={item.status.current_status as EINVOICE_STATUS}
						amount={item.amount}
						from={item.from}
						transactionHash={item.transactionHash}
						network={item.network as NETWORK}
						invoiceId={item.id}
						setInvoices={setInvoices}
					/>
				))
			)}
		</div>
	);
};

export default ReceivedInvoices;
