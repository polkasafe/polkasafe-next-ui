// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import getSubstrateAddress from './getSubstrateAddress';

export default async function addToAddressBook({
	address,
	name,
	addressBook,
	organisationId
}: {
	address: string;
	name?: string;
	addressBook: IAddressBookItem[];
	organisationId: string;
}): Promise<IAddressBookItem[] | undefined> {
	if (!address) return undefined;

	if (!getSubstrateAddress(address)) {
		return undefined;
	}

	try {
		const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
		// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

		if (!userAddress) {
			console.log('ERROR');
			return undefined;
		}
		if (addressBook.some((item) => getSubstrateAddress(item.address) === getSubstrateAddress(address))) {
			queueNotification({
				header: 'Error!',
				message: 'Address exists in Address book.',
				status: NotificationStatus.ERROR
			});
			return undefined;
		}

		const addToAddressBookRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBook_substrate`, {
			body: JSON.stringify({
				address,
				name,
				organisationId
			}),
			headers: firebaseFunctionsHeader(),
			method: 'POST'
		});
		const { data: addAddressData, error: addAddressError } = (await addToAddressBookRes.json()) as {
			data: IAddressBookItem[];
			error: string;
		};

		if (addAddressData && !addAddressError) {
			return addAddressData;
		}
	} catch (error) {
		console.log('ERROR', error);
	}
	return undefined;
}
