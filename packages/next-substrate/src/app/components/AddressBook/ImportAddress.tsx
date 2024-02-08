// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import DragDrop from '@next-substrate/app/components/AddressBook/DragDrop';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import AddBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';

const ImportAdress = ({ onCancel }: { onCancel: () => void }) => {
	const [addresses, setAddresses] = useState<IAddressBookItem[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { addressBook, setUserDetailsContextState } = useGlobalUserDetailsContext();

	const handleAddAddress = async (
		address: string,
		name: string,
		email?: string,
		discord?: string,
		telegram?: string,
		roles?: string[]
	) => {
		try {
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				return;
			}
			if (addressBook.some((item) => item.address === address)) {
				return;
			}

			const { data: addAddressData, error: addAddressError } = await nextApiClientFetch<IAddressBookItem[]>(
				`${SUBSTRATE_API_URL}/addToAddressBook`,
				{
					address,
					discord: discord || '',
					email: email || '',
					name,
					roles: roles || [],
					telegram: telegram || ''
				}
			);

			if (addAddressError) {
				queueNotification({
					header: 'Error!',
					message: addAddressError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			if (addAddressData) {
				setUserDetailsContextState((prevState) => {
					return {
						...prevState,
						addressBook: addAddressData
					};
				});
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const addImportedAddresses = () => {
		setLoading(true);
		Promise.all(
			addresses.map((item) =>
				handleAddAddress(item.address, item.name, item.email, item.discord, item.telegram, item.roles)
			)
		).then(() => {
			queueNotification({
				header: 'Success!',
				message: 'Addresses Added.',
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			onCancel();
		});
	};

	return (
		<div className='flex flex-col w-[560px]'>
			<div className='bg-bg-secondary p-4 m-3 rounded-md'>
				<DragDrop setAddresses={setAddresses} />
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<AddBtn
					onClick={addImportedAddresses}
					loading={loading}
					title='Import'
				/>
			</div>
		</div>
	);
};

export default ImportAdress;
