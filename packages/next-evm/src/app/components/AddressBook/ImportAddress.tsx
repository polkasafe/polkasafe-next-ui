// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import DragDrop from '@next-evm/app/components/AddressBook/DragDrop';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import AddBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';

const ImportAdress = ({ onCancel }: { onCancel: () => void }) => {
	const [addresses, setAddresses] = useState<IAddressBookItem[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { activeOrg, setActiveOrg } = useActiveOrgContext();

	const handleAddAddress = async (
		address: string,
		name: string,
		email?: string,
		discord?: string,
		telegram?: string,
		roles?: string[]
		// eslint-disable-next-line sonarjs/cognitive-complexity
	) => {
		try {
			if (!activeOrg || activeOrg?.addressBook?.some((item: any) => item.address === address)) {
				return;
			}

			const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBookEth`, {
				body: JSON.stringify({
					address,
					discord: discord || '',
					email: email || '',
					name,
					organisationId: activeOrg.id,
					roles: roles || [],
					telegram: telegram || ''
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: addAddressData, error: addAddressError } = (await createOrgRes.json()) as {
				data: IAddressBookItem[];
				error: string;
			};

			if (addAddressError) {
				queueNotification({
					header: 'Error!',
					message: addAddressError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			if (addAddressData) {
				setActiveOrg((prevState: any) => {
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
