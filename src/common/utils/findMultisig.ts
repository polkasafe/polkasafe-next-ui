// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@common/enum/substrate';
import { IMultisig } from '@common/types/substrate';

export const findMultisig = (multisigs: Array<IMultisig>, multisigId: string) => {
	const [address, network] = multisigId.split('_');
	const currentMultisig = multisigs.find((multisig) => {
		return multisig.address === address && multisig.network === network;
	});

	if (!currentMultisig && network === ENetwork.PEOPLE) {
		const multi = multisigs.find((multisig) => {
			return (
				multisig.address === address &&
				(multisig.network === ENetwork.POLKADOT || multisig.network === ENetwork.POLKADOT_ASSETHUB)
			);
		});
		if (!multi) {
			return null;
		}
		return { ...multi, network: ENetwork.PEOPLE } as IMultisig;
	}
	return currentMultisig;
};
