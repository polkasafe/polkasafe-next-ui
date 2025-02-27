// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IDBTransaction, IMultisig } from '@common/types/substrate';
import { getMultisigDataByMultisigAddress } from '@sdk/polkasafe-sdk/src/get-multisig-data-by-address';

const parseMultisig = (multisig: any) =>
	({
		name: multisig.name,
		address: multisig.address,
		threshold: multisig.threshold,
		signatories: multisig.signatories,
		balance: multisig.balance,
		disabled: multisig.disabled,
		network: multisig.network,
		createdAt: multisig.created_at,
		updatedAt: multisig.updated_at,
		proxy: multisig.proxy || []
	}) as IMultisig;
export const getMultisigDataAndTransactions = async (address: string, network: string) => {
	const multisigData = await getMultisigDataByMultisigAddress({ address, network });

	// parsing multisig data
	const { data: multisig, error: multisigError } = multisigData as { data: IDBTransaction; error: string };

	if (multisigError) {
		return { error: multisigError };
	}

	return {
		multisig: parseMultisig(multisig)
	};
};
