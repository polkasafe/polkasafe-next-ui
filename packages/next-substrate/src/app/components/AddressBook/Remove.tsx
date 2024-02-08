// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-substrate/app/components/Settings/RemoveBtn';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { ISharedAddressBooks, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';

const RemoveAddress = ({
	addressToRemove,
	name,
	shared,
	onCancel
}: {
	addressToRemove: string;
	name: string;
	shared?: boolean;
	onCancel: () => void;
}) => {
	const { address, activeMultisig, addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleRemoveFromPersonalAddressBook = async () => {
		try {
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

			const { data: removeAddressData, error: removeAddressError } = await nextApiClientFetch<any>(
				`${SUBSTRATE_API_URL}/removeFromAddressBook`,
				{
					address: addressToRemove,
					name
				}
			);

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
				setUserDetailsContextState((prev) => {
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

	const handleRemoveFromSharedAddressBook = async () => {
		try {
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

			const { data: removeAddressData, error: removeAddressError } = await nextApiClientFetch<ISharedAddressBooks>(
				`${SUBSTRATE_API_URL}/removeFromSharedAddressBook`,
				{
					address: addressToRemove,
					multisigAddress: activeMultisig
				}
			);

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
				setActiveMultisigContextState(removeAddressData as any);

				const filteredAddresses = [...addressBook].filter(
					(item) => getSubstrateAddress(item.address) !== getSubstrateAddress(addressToRemove)
				);
				setUserDetailsContextState((prev) => {
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
			{shared ? (
				<p className='text-white font-medium text-sm leading-[15px]'>
					This will delete the address for everyone. Are you sure you want to permanently delete
					<span className='text-primary mx-1.5'>{name}</span>
					from your Multisig&apos;s Address Book?
				</p>
			) : (
				<p className='text-white font-medium text-sm leading-[15px]'>
					Are you sure you want to permanently delete
					<span className='text-primary mx-1.5'>{name}</span>
					from your Personal Address Book?
				</p>
			)}
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					loading={loading}
					onClick={onCancel}
				/>
				<RemoveBtn
					loading={loading}
					onClick={shared ? handleRemoveFromSharedAddressBook : handleRemoveFromPersonalAddressBook}
				/>
			</div>
		</Form>
	);
};

export default RemoveAddress;
