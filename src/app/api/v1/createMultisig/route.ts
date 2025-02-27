// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION } from '@common/db/collections';
import { IDBMultisig } from '@common/types/substrate';
import { ENetwork, EUserType } from '@common/enum/substrate';
import { addressToEvm, encodeAddress, encodeMultiAddress, evmToAddress } from '@polkadot/util-crypto';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { keyring } from '@polkadot/ui-keyring';
import { bnToBn, objectSpread, u8aSorted } from '@polkadot/util';

import { createKeyMulti } from '@polkadot/util-crypto';
import { KeyringInstance, KeyringOptions, KeyringPair$Meta } from '@polkadot/keyring/types';
import { createTestKeyring } from '@polkadot/keyring';

const updateDB = async (multisigs: Array<IDBMultisig>) => {
	try {
		Promise.all(
			multisigs.map(async (multisig) =>
				MULTISIG_COLLECTION.doc(`${multisig.address}_${multisig.network}`).set(multisigs, { merge: true })
			)
		);
	} catch (err: unknown) {
		console.log('Error in updateDB:', err);
	}
};

function addMultisig(addresses: Array<string>, threshold: number, meta = {}, keyring: KeyringInstance) {
	let address = createKeyMulti(addresses, threshold);
	address = address.slice(0, 20); // for ethereum addresses
	// we could use `sortAddresses`, but rather use internal encode/decode so we are 100%
	const who = u8aSorted(addresses.map((who) => keyring.decodeAddress(who))).map((who) => keyring.encodeAddress(who));
	const meta1 = objectSpread({}, meta, {
		isMultisig: true,
		threshold: bnToBn(threshold).toNumber(),
		who
	});
	const pair = keyring.addFromAddress(address, objectSpread({}, meta1, { isExternal: true }) as KeyringPair$Meta, null);
	console.log('MultiSig address created::', pair.address);
	return pair.address;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { name, signatories, network, threshold, proxy = [] } = await req.json();
		console.log('signatories', signatories);
		if (!name || !signatories || !network || !threshold) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (!Array.isArray(signatories)) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS }, { status: 400 });
		}
		if (signatories.length < 2) {
			return NextResponse.json({ error: 'You should have at least one signatories' }, { status: 400 });
		}
		if (!threshold) {
			return NextResponse.json({ error: 'threshold is required' }, { status: 400 });
		}
		const options = {
			ss58Format: networkConstants[network as ENetwork].ss58Format,
			type: 'ethereum'
		};
		const keyring = createTestKeyring(options as KeyringOptions, true);
		const multiSigOptions = {
			name
		};
		const multiSigAddress = addMultisig(signatories, threshold, multiSigOptions, keyring);
		console.log('multiSigAddress', multiSigAddress);

		const payload: IDBMultisig = {
			name,
			signatories: signatories,
			network,
			address: multiSigAddress,
			threshold,
			type: EUserType.SUBSTRATE,
			created_at: new Date(),
			updated_at: new Date(),
			proxy
		};
		updateDB([payload]);
		return NextResponse.json({ data: payload, error: null });
	} catch (err: unknown) {
		console.log('Error in create multisigs:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
