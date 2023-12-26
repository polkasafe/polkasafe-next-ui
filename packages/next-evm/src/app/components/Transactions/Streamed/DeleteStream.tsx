// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import RemoveBtn from '@next-evm/app/components/Multisig/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';

const DeleteStream = ({ recipient, onCancel }: { recipient: string; onCancel: () => void }) => {
	const { network } = useGlobalApiContext();
	const { gnosisSafe, address, activeMultisig } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);

	const deleteStream = async () => {
		if (!activeMultisig || !recipient || !address) return;

		try {
			setLoading(true);
			const safeTxHash = await gnosisSafe.createDeleteStreamTx(
				activeMultisig,
				recipient,
				address,
				chainProperties[network].nativeSuperTokenAddress
			);

			if (safeTxHash) {
				queueNotification({
					header: 'Success!',
					message: 'New transaction Created For Approval',
					status: NotificationStatus.SUCCESS
				});
				onCancel();
			} else {
				queueNotification({
					header: 'Failed!',
					message: 'Please Try again',
					status: NotificationStatus.ERROR
				});
			}
			setLoading(false);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	return (
		<Form className='my-0 w-[560px]'>
			<p className='text-white font-medium text-sm leading-[15px]'>Are you sure you want to delete this Stream?</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<RemoveBtn
					title='Remove'
					loading={loading}
					onClick={deleteStream}
				/>
			</div>
		</Form>
	);
};

export default DeleteStream;
