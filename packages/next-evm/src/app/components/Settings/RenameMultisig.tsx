// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Input } from 'antd';
import React, { useState } from 'react';
import CancelBtn from '@next-evm/app/components/Settings/CancelBtn';
import ModalBtn from '@next-evm/app/components/Settings/ModalBtn';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';

const RenameMultisig = ({
	name,
	onCancel,
	multisig
}: {
	name: string;
	onCancel: () => void;
	multisig: IMultisigAddress;
}) => {
	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [multisigName, setMultisigName] = useState<string>(name);
	const [loading, setLoading] = useState<boolean>(false);
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const handleMultisigNameChange = async () => {
		try {
			setLoading(true);

			if (!multisig.address) {
				console.log('ERROR');
				setLoading(false);
			} else {
				const changeSafeNameres = await fetch(`${FIREBASE_FUNCTIONS_URL}/renameMultisigEth`, {
					body: JSON.stringify({
						address: multisig.address,
						name: multisigName,
						network: multisig.network,
						organisationId: activeOrg.id
					}),
					headers: firebaseFunctionsHeader(connectedWallet.address),
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
					setUserDetailsContextState((prev: any) => {
						return {
							...prev,
							multisigSettings: {
								...prev.multisigSettings,
								[`${multisig.address}_${multisig.network}`]: {
									...prev.multisigSettings[`${multisig.address}_${multisig.network}`],
									name: multisigName
								}
							}
						};
					});

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
