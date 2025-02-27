// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Wallet } from '@common/enum/substrate';
import { stringToHex } from '@polkadot/util';

export const getSignature = async (selectedWallet: string, token: string, address: string) => {
	console.log('selectedWallet', selectedWallet);
	const wallet = selectedWallet === Wallet.SUBWALLET ? (window as any).SubWallet : (window as any).talismanEth;

	if (!wallet) {
		return '';
	}
	const signature = await wallet.request({
		method: 'personal_sign',
		params: [stringToHex(token), address]
	});
	return signature;
};
