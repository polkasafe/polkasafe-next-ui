import Button from '@common/global-ui-components/Button';
import { AddressBookIcon } from '@common/global-ui-components/Icons';
import copyText from '@common/utils/copyText';
import { Divider } from 'antd';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SharePaymentRequest = ({
	setStep,
	invoiceId,
	setInvoiceId
}: {
	setStep: React.Dispatch<React.SetStateAction<number>>;
	invoiceId: string;
	setInvoiceId: React.Dispatch<React.SetStateAction<string>>;
}) => {
	useEffect(() => {
		const id = uuidv4();
		setInvoiceId(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='flex flex-col'>
			<Button
				className='w-full flex justify-center items-center'
				icon={<AddressBookIcon />}
				onClick={() => setStep((prev) => prev + 1)}
			>
				Select the contact you are requesting payment from
			</Button>
			<Divider className='border-text_placeholder text-white'>OR</Divider>
			<label className='text-text_secondary text-xs capitalize mb-1'>
				Share the link below to receive payment requests
			</label>
			<Button
				onClick={() => copyText(`https://app.polkasafe.xyz/invoice/${invoiceId}`)}
				className='border-text_placeholder bg-bg-secondary w-full flex justify-center items-center text-white'
			>
				Copy Shareable Link
			</Button>
		</div>
	);
};

export default SharePaymentRequest;
