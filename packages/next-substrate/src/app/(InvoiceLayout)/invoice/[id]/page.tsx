// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { chainProperties } from '@next-common/global/networkConstants';
import { EINVOICE_STATUS, IInvoice, NotificationStatus } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ArrowRightCircle } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';
import CompleteInvoicePayment from '@next-substrate/app/components/Invoices/CompletePayment';
import { ParachainIcon } from '@next-substrate/app/components/NetworksDropdown/NetworkCard';
import React, { useEffect, useState } from 'react';

const Invoice = ({ params }: { params: { id: string } }) => {
	const [openPaymentModal, setOpenPaymentModal] = useState(false);
	const [modalTitle, setModalTitle] = useState<string>('');

	const address = '';

	const invoiceId = params?.id;

	const [loading, setLoading] = useState<boolean>(false);

	const [invoiceData, setInvoiceData] = useState<IInvoice>(null);

	useEffect(() => {
		const fetchInvoiceById = async () => {
			if (!invoiceId) return;

			setLoading(true);

			const createInvoiceRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getInvoiceDetailsByInvoiceId`, {
				body: JSON.stringify({
					invoiceId
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data, error: invoiceError } = (await createInvoiceRes.json()) as {
				data: IInvoice;
				error: string;
			};
			if (invoiceError) {
				queueNotification({
					header: 'Error in Fetching Invoices!',
					message: invoiceError,
					status: NotificationStatus.ERROR
				});
				setInvoiceData(null);
			}
			if (data && !invoiceError) {
				console.log('invoice data', data, invoiceError);
				setInvoiceData(data);
			}
			setLoading(false);
		};
		fetchInvoiceById();
	}, [invoiceId]);

	return loading ? (
		<main className='h-screen w-screen flex items-center justify-center text-2xl text-white'>
			<Loader size='large' />
		</main>
	) : !invoiceData ? (
		<div className='text-white'>No data found</div>
	) : (
		<>
			<ModalComponent
				title={modalTitle}
				onCancel={() => setOpenPaymentModal(false)}
				open={openPaymentModal}
			>
				<CompleteInvoicePayment
					onModalChange={(title) => setModalTitle(title)}
					onCancel={() => setOpenPaymentModal(false)}
					requestedAmount={invoiceData.amount}
					receiverAddress={invoiceData.from}
					approvingAddress={address}
					status={invoiceData.status.current_status as EINVOICE_STATUS}
					invoiceId={invoiceData.id}
					to={invoiceData.to}
					requestedNetwork={invoiceData.network}
				/>
			</ModalComponent>
			<div className='bg-bg-secondary w-[50%] p-[30px] rounded-xl'>
				<h1 className='text-lg font-bold text-white mb-8'>Invoice Details</h1>
				<div className='flex flex-col gap-y-4 text-white'>
					<div className='flex justify-between'>
						<span>Requested Amount: </span>
						<div className='rounded-lg bg-bg-main px-2 py-1 flex justify-between items-center text-white'>
							{invoiceData.amount} USD
						</div>
					</div>
					<div className='flex justify-between'>
						<span>Receiver Address: </span>
						<AddressComponent
							address={invoiceData.from}
							onlyAddress
						/>
					</div>
					<div className='flex justify-between'>
						<span>Request Network: </span>
						<span className='capitalize flex gap-x-2'>
							<ParachainIcon
								src={chainProperties[invoiceData.network].logo}
								size={18}
							/>{' '}
							{invoiceData.network}
						</span>
					</div>
					<div className='flex justify-between'>
						<span>Status: </span>
						<span className='capitalize flex gap-x-2'>{invoiceData.status.current_status}</span>
					</div>
					{invoiceData.note && (
						<div className='flex justify-between'>
							<span>Note: </span>
							<span className='capitalize flex gap-x-2'>{invoiceData.note}</span>
						</div>
					)}
				</div>
				<div className='flex w-full justify-center mt-10'>
					<PrimaryButton
						loading={loading}
						disabled={invoiceData.status.current_status === EINVOICE_STATUS.PAID}
						onClick={() => setOpenPaymentModal(true)}
						className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
						size='large'
					>
						Pay Now
						<ArrowRightCircle className='text-sm' />
					</PrimaryButton>
				</div>
			</div>
		</>
	);
};

export default Invoice;
