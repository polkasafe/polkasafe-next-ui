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
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';

const DeleteField = ({
	onCancel,
	subfield,
	category
}: {
	onCancel: () => void;
	category: string;
	subfield: string;
}) => {
	const { transactionFields, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleDeleteField = async () => {
		try {
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
			} else {
				setLoading(true);

				const newTransactionFields = { ...transactionFields };
				const newSubfields = { ...newTransactionFields[category].subfields };
				delete newSubfields[subfield];

				const { data: updateTransactionFieldsData, error: updateTransactionFieldsError } = await nextApiClientFetch(
					`${SUBSTRATE_API_URL}/updateTransactionFields`,
					{
						transactionFields: {
							...transactionFields,
							[category]: {
								...transactionFields[category],
								subfields: newSubfields
							}
						}
					}
				);

				if (updateTransactionFieldsError) {
					queueNotification({
						header: 'Failed!',
						message: updateTransactionFieldsError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (updateTransactionFieldsData) {
					queueNotification({
						header: 'Success!',
						message: 'Transaction Fields Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prev) => ({
						...prev,
						transactionFields: {
							...prev.transactionFields,
							[category]: {
								...prev.transactionFields[category],
								subfields: newSubfields
							}
						}
					}));
					setLoading(false);
					onCancel();
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	return (
		<Form className='my-0 w-[560px]'>
			<p className='text-white font-medium text-sm leading-[15px]'>
				Are you sure you want to delete
				<span className='text-primary mx-1.5'>{transactionFields[category].subfields?.[subfield].subfieldName}</span>?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<RemoveBtn
					loading={loading}
					onClick={handleDeleteField}
				/>
			</div>
		</Form>
	);
};

export default DeleteField;
