// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ISharedAddressBooks, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import getSubstrateAddress from './getSubstrateAddress';
import nextApiClientFetch from './nextApiClientFetch';

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
	roles
}: IAddToSharedAddressBook) {
	if (!address || !name || !multisigAddress) return;

	if (!getSubstrateAddress(address)) {
		return;
	}

	try {
		const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
		// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

		if (!userAddress) {
			console.log('ERROR');
			return;
		}
		const { data: addAddressData, error: addAddressError } = await nextApiClientFetch<ISharedAddressBooks>(
			`${SUBSTRATE_API_URL}/updateSharedAddressBook`,
			{
				address,
				discord,
				email,
				multisigAddress,
				name,
				roles,
				telegram
			}
		);

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
	} catch (error) {
		console.log('ERROR', error);
	}
}
