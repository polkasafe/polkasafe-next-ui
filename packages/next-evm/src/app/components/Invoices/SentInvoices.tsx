import Image from 'next/image';
import React from 'react';
import sentInvoiceImage from '@next-common/assets/SentInvoice.png';
import dayjs from 'dayjs';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import formatBalance from '@next-evm/utils/formatBalance';
import { IInvoice } from '@next-common/types';

const SentInvoices = ({ invoices }: { invoices: IInvoice[] }) => {
	console.log('invoices', invoices);
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
				<div className='w-full flex items-center flex-col gap-y-2 mt-5'>
					<Image
						src={sentInvoiceImage}
						alt='sent invoice'
					/>
					<span className='text-sm text-text_secondary'>No Invoices Sent</span>
				</div>
			) : (
				invoices.map((item, i) => (
					<div className='border-b border-text_secondary py-4 px-4 grid items-center grid-cols-7 gap-x-5 text-white font-normal text-sm leading-[15px]'>
						<p className='col-span-1'>{dayjs(item.status.history[0].updated_at).format('lll')}</p>
						<p className='col-span-1'># {i + 1}</p>
						<p className='col-span-2'>
							<AddressComponent address={item.from} />
						</p>
						<p className='col-span-1'>Not Paid</p>
						<p className='col-span-1'>$ {formatBalance(item.amount)}</p>
						<p className='col-span-1 flex justify-between items-center'>
							<span className='text-waiting capitalize'>{item.status.current_status}</span>
						</p>
					</div>
				))
			)}
		</div>
	);
};

export default SentInvoices;
