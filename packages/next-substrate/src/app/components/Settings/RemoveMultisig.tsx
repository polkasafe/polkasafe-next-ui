// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-substrate/app/components/Settings/RemoveBtn';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

const RemoveMultisigAddress = ({ onCancel }: { onCancel: () => void }) => {
	const { activeMultisig, multisigAddresses, multisigSettings, setUserDetailsContextState } =
		useGlobalUserDetailsContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { network } = useGlobalApiContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

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

			const removeSafeRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/deleteMultisig`, {
				body: JSON.stringify({
					multisigAddress: multisig.address
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: removeSafeData, error: removeSafeError } = (await removeSafeRes.json()) as {
				data: string;
				error: string;
			};

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
				setUserDetailsContextState((prevState) => {
					const newMutlisigArray = copy.filter(
						(item) => item.address !== activeMultisig || item.proxy === activeMultisig
					);
					if (
						newMutlisigArray &&
						newMutlisigArray[0]?.address &&
						!multisigSettings?.[`${newMutlisigArray[0]?.address}_${newMutlisigArray[0]?.network}`]?.deleted
					) {
						localStorage.setItem('active_multisig', newMutlisigArray[0].address);
					} else {
						localStorage.removeItem('active_multisig');
					}
					return {
						...prevState,
						activeMultisig: localStorage.getItem('active_multisig') || '',
						multisigAddresses: newMutlisigArray,
						multisigSettings: {
							...prevState.multisigSettings,
							[`${multisig.address}_${multisig.network}`]: {
								...prevState.multisigSettings[`${multisig.address}_${multisig.network}`],
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
					{multisigSettings?.[`${activeMultisig}_${network}`]?.name ||
						multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig)?.name ||
						DEFAULT_MULTISIG_NAME}
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
