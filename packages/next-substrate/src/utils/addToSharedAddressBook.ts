// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { ISharedAddressBooks, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import getSubstrateAddress from './getSubstrateAddress';

interface IAddToSharedAddressBook {
	address: string;
	name: string;
	multisigAddress: string;
	email?: string;
	discord?: string;
	telegram?: string;
	roles?: string[];
	network: string;
}

export default async function addToSharedAddressBook({
	address,
	multisigAddress,
	name,
	email,
	discord,
	telegram,
	roles,
	network
}: IAddToSharedAddressBook) {
	if (!address || !name || !multisigAddress) return;

	if (!getSubstrateAddress(address)) {
		return;
	}

	try {
		const userAddress = localStorage.getItem('address');
		const signature = localStorage.getItem('signature');

		if (!userAddress || !signature) {
			console.log('ERROR');
		} else {
			const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateSharedAddressBook`, {
				body: JSON.stringify({
					address,
					discord,
					email,
					multisigAddress,
					name,
					roles,
					telegram
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: addAddressData, error: addAddressError } = (await addAddressRes.json()) as {
				data: ISharedAddressBooks;
				error: string;
			};

			if (addAddressError) {
				queueNotification({
					header: 'Error!',
					message: addAddressError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			if (addAddressData) {
				console.log(addAddressData);
			}
		}
	} catch (error) {
		console.log('ERROR', error);
	}
}
