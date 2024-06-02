// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { chainProperties } from '@next-common/global/networkConstants';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import Client from '@walletconnect/sign-client';
import { WC_POLKADOT_METHODS } from '@next-common/types';
import BN from 'bn.js';

export default async function wcSignTransaction(
	api: ApiPromise,
	network: string,
	senderAddress: string,
	tx: SubmittableExtrinsic<'promise', any>,
	client: Client,
	topic: string,
	tip?: BN
) {
	if (!api || !network || !senderAddress) return;

	const callData = api.createType('Call', tx);

	const lastHeader = await api.rpc.chain.getHeader();
	const blockNumber = api.registry.createType('BlockNumber', lastHeader.number.toNumber());

	const era = api.registry.createType('ExtrinsicEra', {
		current: lastHeader.number.toNumber(),
		period: 64
	});

	const nonce = await api.rpc.system.accountNextIndex(senderAddress);

	const transactionPayload = {
		address: `${senderAddress}`,
		blockHash: lastHeader.hash.toHex(),
		blockNumber: blockNumber.toHex(),
		era: era.toHex(),
		genesisHash: api.genesisHash.toHex(),
		method: callData.toHex(),
		nonce: nonce.toHex(),
		signedExtensions: [
			'CheckNonZeroSender',
			'CheckSpecVersion',
			'CheckTxVersion',
			'CheckGenesis',
			'CheckMortality',
			'CheckNonce',
			'CheckWeight',
			'ChargeTransactionPayment'
		],
		specVersion: api.runtimeVersion.specVersion.toHex(),
		tip: api.registry.createType('Compact<Balance>', tip).toHex(),
		transactionVersion: api.runtimeVersion.transactionVersion.toHex(),
		version: tx.version
	};
	try {
		const result = await client!.request<{
			payload: string;
			signature: string;
		}>({
			chainId: chainProperties[network].chainId,
			request: {
				method: WC_POLKADOT_METHODS.POLKADOT_SIGN_TRANSACTION,
				params: {
					address: senderAddress,
					transactionPayload
				}
			},
			topic
		});
		if (result.signature) {
			const rawUnsignedTransaction = api.registry.createType('ExtrinsicPayload', transactionPayload, {
				version: transactionPayload.version
			});

			tx.addSignature(senderAddress, result.signature as `0x${string}`, rawUnsignedTransaction.toHex());
		}
	} catch (e) {
		console.log('wc_signTransaction error', e);
	}
}
