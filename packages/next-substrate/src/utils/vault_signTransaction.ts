// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { chainProperties } from '@next-common/global/networkConstants';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import BN from 'bn.js';
import { QrState } from '@next-common/types';
import { QrSigner } from './QrSigner';

export default async function vaultSignTransaction(
	api: any,
	network: string,
	senderAddress: string,
	tx: SubmittableExtrinsic<'promise', any>,
	setQrState: React.Dispatch<React.SetStateAction<QrState>>,
	tip?: BN
) {
	if (!api || !network || !senderAddress) return;

	// const callData = api.createType('Call', tx);

	// const lastHeader = await api.rpc.chain.getHeader();
	// const blockNumber = api.registry.createType('BlockNumber', lastHeader.number.toNumber());

	// const era = api.registry.createType('ExtrinsicEra', {
	// current: lastHeader.number.toNumber(),
	// period: 64
	// });

	// const nonce = await api.rpc.system.accountNextIndex(senderAddress);

	// const transactionPayload = {
	// address: senderAddress,
	// blockHash: lastHeader.hash.toHex(),
	// blockNumber: blockNumber.toHex(),
	// era: era.toHex(),
	// genesisHash: api.genesisHash.toHex(),
	// method: callData.toHex(),
	// nonce: nonce.toHex(),
	// specVersion: api.runtimeVersion.specVersion.toHex(),
	// tip: api.registry.createType('Compact<Balance>', tip).toHex(),
	// transactionVersion: api.runtimeVersion.transactionVersion.toHex(),
	// version: tx.version
	// };
	const tipHex = api.registry.createType('Compact<Balance>', tip).toHex();
	try {
		const signer = new QrSigner(api.registry, setQrState);
		await tx.signAsync(senderAddress, { nonce: -1, signer, tip: tipHex });
	} catch (e) {
		console.log('vault_signtransaction error', e);
	}
}
