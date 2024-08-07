// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Input } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { NotificationStatus } from '@next-common/types';
import { CheckOutlined, Disc, NotifyMail, CloseIcon } from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';

const EmailBadge = () => {
	const { network } = useGlobalApiContext();

	const [showBadge, setShowBadge] = useState<boolean>(true);
	const [showDiv, setShowDiv] = useState<boolean>(true);
	const [inputValue, setInputValue] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	function handleChange(event: { target: { value: React.SetStateAction<string> } }) {
		setInputValue(event.target.value);
	}

	const handleAddEmail = async () => {
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			const { data: addEmailData, error: addEmailError } = await nextApiClientFetch<string>(
				`${FIREBASE_FUNCTIONS_URL}/updateEmail`,
				{
					email: inputValue
				},
				{ network }
			);

			if (addEmailError) {
				queueNotification({
					header: 'Error!',
					message: addEmailError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (addEmailData) {
				queueNotification({
					header: 'Success!',
					message: 'Your Email has been added successfully!',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				setShowBadge(false);
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};
	function handleCancel() {
		setShowDiv(false);
	}
	return showBadge ? (
		<div className='flex items-center justify-between scale-[80%] w-[125%] h-[125%] origin-top-left mb-2 h-[87px] bg-gradient-to-r from-highlight to-bg-main rounded-lg'>
			<div className='flex items-center justify-center'>
				<Disc className='mx-5' />
				<div>
					<h1 className='text-white text-xl font-bold'>Get Notified</h1>
					<p className='text-white text-sm'>Enter your email to get notifications for your Safe</p>
				</div>
			</div>
			<div className='flex items-center justify-around mr-5'>
				<Input
					value={inputValue}
					className='placeholder-text_secondary text-white p-2 outline-none border-none min-w-[300px] mr-1'
					placeholder='name@example.com'
					onChange={(e) => handleChange(e)}
				/>
				<Button
					loading={loading}
					disabled={!inputValue}
					className='flex items-center justify-center bg-primary text-white border-none ml-1 py-4'
					onClick={handleAddEmail}
					icon={<NotifyMail />}
				>
					Notify me
				</Button>
			</div>
		</div>
	) : (
		<div>
			{showDiv ? (
				<div className='flex items-center justify-between scale-[80%] w-[125%] h-[125%] origin-top-left mb-2 h-[87px] bg-gradient-to-r from-highlight to-bg-main rounded-lg'>
					<div className='flex items-center justify-center'>
						<CheckOutlined className='mx-5 text-success' />
						<div>
							<h1 className='text-white text-xl font-bold'>Email has been updated successfully!</h1>
							<p className='text-white text-sm'>You’re all set to receive regular notifications on your mail 👍</p>
						</div>
					</div>
					<div className='flex items-center justify-around mr-5'>
						<Button
							onClick={() => handleCancel()}
							className='bg-transparent border-none'
						>
							<div className='bg-highlight rounded-full w-5 h-5 flex items-center justify-center cursor-pointer'>
								<CloseIcon className='w-2 h-2 rounded-full' />
							</div>
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default EmailBadge;
