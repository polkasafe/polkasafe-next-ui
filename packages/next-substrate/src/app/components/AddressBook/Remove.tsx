// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-substrate/app/components/Settings/RemoveBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';

const RemoveAddress = ({
	addressToRemove,
	name,
	onCancel
}: {
	addressToRemove: string;
	name: string;
	onCancel: () => void;
}) => {
	const { address } = useGlobalUserDetailsContext();
	const { activeOrg, setActiveOrg } = useActiveOrgContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleRemoveFromPersonalAddressBook = async () => {
		if (!activeOrg || !activeOrg?.addressBook) return;

		try {
			const addressBook = activeOrg?.addressBook || [];
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			if (addressToRemove === address) {
				setLoading(false);
				return;
			}

			const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/removeFromAddressBook_substrate`, {
				body: JSON.stringify({
					address: addressToRemove,
					organisationId: activeOrg.id
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: removeAddressData, error: removeAddressError } = (await createOrgRes.json()) as {
				data: any;
				error: string;
			};

			if (removeAddressError) {
				queueNotification({
					header: 'Error!',
					message: removeAddressError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (removeAddressData) {
				const filteredAddresses = [...addressBook].filter((item) => item.address !== addressToRemove);
				setActiveOrg((prev) => {
					return {
						...prev,
						addressBook: filteredAddresses
					};
				});

				queueNotification({
					header: 'Success!',
					message: 'Your address has been removed successfully!',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				onCancel();
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<Form className='my-0 w-[560px]'>
			<p className='text-white font-medium text-sm leading-[15px]'>
				Are you sure you want to permanently delete
				<span className='text-primary mx-1.5'>{name}</span>
				from your Personal Address Book?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					loading={loading}
					onClick={onCancel}
				/>
				<RemoveBtn
					loading={loading}
					onClick={handleRemoveFromPersonalAddressBook}
				/>
			</div>
		</Form>
	);
};

export default RemoveAddress;
