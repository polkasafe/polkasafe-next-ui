// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { ApiPromise as AvailApiPromise } from 'avail-js-sdk';

export const getCallData = async (api: ApiPromise | AvailApiPromise, callHash: string): Promise<any> => {
	const callData = await api.query.multisig.calls(callHash);
	if (callData.isEmpty) {
		console.error('Call data not found');
		return null;
	}

	return callData.toHex();
};
