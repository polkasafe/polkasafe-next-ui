// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from './nextApiClientFetch';

const addToAddressBook = async ({
	address,
	name,
	addressBook,
	network
}: {
	address: string;
	name?: string;
	addressBook: IAddressBookItem[];
	network: string;
}) => {
	if (!address) return null;

	if (!address) {
		return null;
	}

	try {
		const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
		const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

		if (!userAddress || !signature) {
			console.log('ERROR');
			return null;
		}
		if (addressBook.some((item) => item.address === address)) {
			queueNotification({
				header: 'Error!',
				message: 'Address exists in Address book.',
				status: NotificationStatus.ERROR
			});
			return null;
		}

		const { data: addAddressData, error: addAddressError } = await nextApiClientFetch<IAddressBookItem[]>(
			`${EVM_API_URL}/addToAddressBookEth`,
			{
				address,
				name
			},
			{ network }
		);
		if (addAddressError) {
			return null;
		}

		if (addAddressData) {
			return addAddressData;
		}
		return null;
	} catch (error) {
		console.log('ERROR', error);
		return null;
	}
};

export default addToAddressBook;
