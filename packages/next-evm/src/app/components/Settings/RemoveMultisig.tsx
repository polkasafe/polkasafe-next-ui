// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-evm/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-evm/app/components/Settings/RemoveBtn';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';

const RemoveMultisigAddress = ({ onCancel }: { onCancel: () => void }) => {
	const { activeMultisig, multisigAddresses, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { network } = useGlobalApiContext();

	const multisig = multisigAddresses.find(
		(item: any) => item.address === activeMultisig || item.proxy === activeMultisig
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleRemoveSafe = async () => {
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature || !multisig?.address) {
				console.log('ERROR');
				setLoading(false);
				return;
			}

			const { data: removeSafeData, error: removeSafeError } = await nextApiClientFetch<string>(
				`${EVM_API_URL}/deleteMultisigEth`,
				{
					multisigAddress: multisig.address
				},
				{ network }
			);

			if (removeSafeError) {
				queueNotification({
					header: 'Error!',
					message: removeSafeError,
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			if (removeSafeData && removeSafeData === 'Success') {
				setLoading(false);
				const copy = [...multisigAddresses];
				setUserDetailsContextState((prevState: any) => {
					const newMutlisigArray = copy.filter(
						(item) => item.address !== activeMultisig || item.proxy === activeMultisig
					);
					if (typeof window !== 'undefined') {
						if (newMutlisigArray && newMutlisigArray[0]?.address) {
							localStorage.setItem('active_multisig', newMutlisigArray[0].address);
						} else {
							localStorage.removeItem('active_multisig');
						}
					}
					return {
						...prevState,
						activeMultisig: (typeof window !== 'undefined' && localStorage.getItem('active_multisig')) || '',
						multisigAddresses: newMutlisigArray,
						multisigSettings: {
							...prevState.multisigSettings,
							[multisig.address]: {
								...prevState.multisigSettings[multisig.address],
								deleted: true
							}
						}
					};
				});
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
				<span className='text-primary mx-1.5'>
					{multisigAddresses?.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig)
						?.name || DEFAULT_MULTISIG_NAME}
				</span>
				?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<RemoveBtn
					loading={loading}
					onClick={handleRemoveSafe}
				/>
			</div>
		</Form>
	);
};

export default RemoveMultisigAddress;
