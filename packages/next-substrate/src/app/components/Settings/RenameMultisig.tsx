// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import ModalBtn from '@next-substrate/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { networks } from '@next-common/global/networkConstants';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';

const RenameMultisig = ({
	name,
	onCancel,
	multisig
}: {
	name: string;
	onCancel: () => void;
	multisig?: IMultisigAddress;
}) => {
	const [multisigName, setMultisigName] = useState<string>(name);
	const [loading, setLoading] = useState<boolean>(false);
	const { activeOrg } = useActiveOrgContext();
	const { setUserDetailsContextState, userID } = useGlobalUserDetailsContext();

	const network = multisig.network || networks.POLKADOT;

	const encodedMultisigAddress = getEncodedAddress(multisig.address || '', network);

	const handleMultisigNameChange = async () => {
		try {
			setLoading(true);
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userID || !multisig?.address || !activeOrg) {
				console.log('ERROR');
				setLoading(false);
			} else {
				const changeSafeNameres = await fetch(`${FIREBASE_FUNCTIONS_URL}/renameMultisig_substrate`, {
					body: JSON.stringify({
						address: multisig.address,
						name: multisigName,
						network,
						organisationId: activeOrg.id
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: changeNameData, error: changeNameError } = (await changeSafeNameres.json()) as {
					data: string;
					error: string;
				};

				if (changeNameError) {
					queueNotification({
						header: 'Error!',
						message: changeNameError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (changeNameData) {
					const copyMultisigAddresses = [...activeOrg.multisigs];
					const copyObject = copyMultisigAddresses?.find((item) => item.address === multisig.address);
					if (copyObject) {
						copyObject.name = multisigName;
						setUserDetailsContextState((prev) => {
							return {
								...prev,
								multisigAddresses: copyMultisigAddresses,
								multisigSettings: {
									...prev.multisigSettings,
									[`${encodedMultisigAddress}_${network}`]: {
										...prev.multisigSettings[`${encodedMultisigAddress}_${network}`],
										name: multisigName
									}
								}
							};
						});
					}

					queueNotification({
						header: 'Success!',
						message: 'Multisig Renamed!',
						status: NotificationStatus.SUCCESS
					});
					setLoading(false);
					onCancel();
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<Form className='my-0'>
			<div className='flex flex-col gap-y-3'>
				<label
					className='text-white font-anormal text-sm leading-[15px]'
					htmlFor='review'
				>
					Enter Name
				</label>
				<Form.Item
					name='multisig_name'
					rules={[]}
					className='border-0 outline-0 my-0 p-0'
					initialValue={multisigName}
				>
					<Input
						placeholder='Mutlisig Name'
						className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						id='multisig_name'
						value={multisigName}
						defaultValue={multisigName}
						onChange={(e) => setMultisigName(e.target.value)}
					/>
				</Form.Item>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={onCancel} />
				<ModalBtn
					loading={loading}
					onClick={handleMultisigNameChange}
					title='Update'
				/>
			</div>
		</Form>
	);
};

export default RenameMultisig;
