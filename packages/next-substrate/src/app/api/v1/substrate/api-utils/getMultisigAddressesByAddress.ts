// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IMultisigAddress } from '@next-common/types';
import { firestoreDB } from '../../../../../utils/firebaseInit';

export default async function getMultisigAddressesByAddress(address: string): Promise<IMultisigAddress[]> {
	const multisigAddresses = await firestoreDB
		.collection('multisigAddresses')
		.where('signatories', 'array-contains', address)
		.get();

	return multisigAddresses.docs.map((doc) => ({
		...doc.data(),
		created_at: doc.data().created_at.toDate(),
		updated_at: doc.data().updated_at?.toDate() || doc.data().created_at.toDate()
	})) as IMultisigAddress[];
}
