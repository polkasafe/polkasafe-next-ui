// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EVM_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { Button, Form, Modal } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import useGetWalletAccounts from '@next-evm/hooks/useGetWalletAccounts';
import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import { AddIcon } from '@next-common/ui-components/CustomIcons';
import queueNotification from '@next-common/ui-components/QueueNotification';

interface INewUserModal {
	open: boolean;
	onCancel: () => void;
}

const NewUserModal = ({ open, onCancel }: INewUserModal) => {
	const [loading, setLoading] = useState(false);
	const { network } = useGlobalApiContext();
	const walletAccounts = useGetWalletAccounts();
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();

	const handleAddAddress = async (address: string, name: string) => {
		try {
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
			} else {
				const { data: addAddressData, error: addAddressError } = await nextApiClientFetch<IAddressBookItem[]>(
					`${EVM_API_URL}/addToAddressBookEth`,
					{
						address,
						name
					},
					{ network }
				);

				if (addAddressError) {
					return;
				}

				if (addAddressData) {
					setUserDetailsContextState((prevState: any) => {
						return {
							...prevState,
							addressBook: addAddressData
						};
					});
				}
			}
		} catch (error) {
			console.log('ERROR', error);
		}
	};

	const addToAddressBook = async () => {
		setLoading(true);
		await Promise.all(
			walletAccounts.map(async (account) => {
				await handleAddAddress(account, DEFAULT_ADDRESS_NAME);
			})
		);
		setLoading(false);
		queueNotification({
			header: 'Success!',
			message: 'Addresses Added to Address Book',
			status: NotificationStatus.SUCCESS
		});
		onCancel();
	};

	return (
		<Modal
			centered
			footer={false}
			closable={false}
			title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Wallet Addresses</h3>}
			open={open}
			className='w-auto md:min-w-[500px]'
		>
			<Form className='my-0 w-[560px]'>
				<p className='text-white font-medium text-sm leading-[15px]'>
					Do You Want To Add Your Wallet Addresses To Your Address Book?
				</p>
				<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
					<Button
						size='large'
						disabled={loading}
						className='flex border-none outline-none items-center text-primary text-sm font-normal'
						onClick={onCancel}
					>
						Add Manually Later
					</Button>
					<Button
						loading={loading}
						icon={<AddIcon className='text-sm' />}
						onClick={addToAddressBook}
						size='large'
						className='flex items-center border-none outline-none text-white text-sm font-normal leading-[15px] bg-primary rounded-lg min-w-[130px] justify-center'
					>
						Import
					</Button>
				</div>
			</Form>
		</Modal>
	);
};

export default NewUserModal;
