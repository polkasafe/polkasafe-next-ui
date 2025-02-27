// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IMultisig } from '@common/types/substrate';

export const findMultisig = (multisigs: Array<IMultisig>, multisigId: string) => {
	const [address, network] = multisigId.split('_');
	return multisigs.find((multisig) => {
		return multisig.address.toUpperCase() === address.toUpperCase() && multisig.network === network;
	});
};
