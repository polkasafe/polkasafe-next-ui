// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// of the Apache-2.0 license. See the LICENSE file for details.

import { EVM_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from './nextApiClientFetch';

interface IUpdateMultisigSignatory {
	address: string;
	txBody: any;
	network: string;
}

export default async function updateMultisigSignatory({ address, txBody, network }: IUpdateMultisigSignatory) {
	try {
		return await nextApiClientFetch(`${EVM_API_URL}/updateMultisigSignatory`, txBody, { address, network });
	} catch (error) {
		return { error };
	}
}
