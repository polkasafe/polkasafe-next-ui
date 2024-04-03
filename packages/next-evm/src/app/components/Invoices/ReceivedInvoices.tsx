import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import Image from 'next/image';
import React from 'react';
import receivedInvoiceImage from '@next-common/assets/ReceivedInvoice.png';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import formatBalance from '@next-evm/utils/formatBalance';
import dayjs from 'dayjs';

const ReceivedInvoices = () => {
	const { invoices } = useGlobalUserDetailsContext();
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
			{invoices?.recivedInvoices?.length === 0 ? (
				<div className='w-full flex items-center flex-col mt-10 gap-y-2'>
					<Image
						src={receivedInvoiceImage}
						alt='sent invoice'
					/>
					<span className='text-sm text-text_secondary'>No Invoices Received</span>
				</div>
			) : (
				invoices.recivedInvoices.map((item, i) => (
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

export default ReceivedInvoices;
