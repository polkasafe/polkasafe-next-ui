// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EVM_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from './nextApiClientFetch';

interface Args {
	callHash: string;
	multisigAddress?: string;
	note: string;
	network: string;
}

export default async function updateTransactionNote({
	callHash,
	multisigAddress,
	note,
	network
}: Args): Promise<{ data?: any; error?: string }> {
	const editNoteRes = await nextApiClientFetch(
		`${EVM_API_URL}/updateTransactionNoteEth `,
		{
			callHash,
			multisigAddress: multisigAddress || '',
			note
		},
		{ network }
	);

	return editNoteRes as { data?: any; error?: string };
}
