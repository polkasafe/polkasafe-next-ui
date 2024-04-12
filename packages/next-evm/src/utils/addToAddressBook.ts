// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAddressBookItem, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from './firebaseFunctionHeaders';

const addToAddressBook = async ({
	address,
	name,
	addressBook,
	organisationId
}: {
	address: string;
	name?: string;
	addressBook: IAddressBookItem[];
	organisationId: string;
}) => {
	if (!address) return null;

	if (!address) {
		return null;
	}

	try {
		if (addressBook.some((item) => item.address === address)) {
			queueNotification({
				header: 'Error!',
				message: 'Address exists in Address book.',
				status: NotificationStatus.ERROR
			});
			return null;
		}

		const addToAddressBookRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBookEth`, {
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
