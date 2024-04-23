/* eslint-disable sonarjs/cognitive-complexity */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sonarjs/no-duplicate-string */

import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import addNewTransaction from '@next-substrate/utils/addNewTransaction';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import notify from '@next-substrate/utils/notify';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { sortAddresses } from '@polkadot/util-crypto';
import { BN_ZERO } from '@polkadot/util';
import sendNotificationToAddresses from '@next-substrate/utils/sendNotificationToAddresses';

interface Props {
	api: ApiPromise | any;
	apiReady: boolean;
	network: string;
	tx: SubmittableExtrinsic<'promise'>;
	address: string;
	isProxy: boolean;
	multisig: IMultisigAddress;
	tip?: any;
	setLoadingMessages: any;
}
const executeTx = async ({
	api,
	apiReady,
	network,
	tx,
	address,
	isProxy,
	multisig,
	tip,
	setLoadingMessages
}: Props) => {
	if (!api || !apiReady || !tx) return;

	const encodedInitiatorAddress = getEncodedAddress(address, network);
	if (!encodedInitiatorAddress) throw new Error('Invalid initiator address');
	let callData = tx.method.toHex();
	let callHash = tx.method.hash.toHex();

	if (isProxy && multisig?.proxy) {
		const proxyTx = api.tx.proxy.proxy(multisig.proxy, null, tx);
		callData = proxyTx.method.toHex();
		callHash = proxyTx.method.hash.toHex();
	}

	const encodedSignatories = multisig.signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if (!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});

	const TIME_POINT = null;

	// remove initator address from signatories
	const otherSignatories = encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);
	const otherSignatoriesSorted = sortAddresses(otherSignatories, chainProperties[network].ss58Format);
	const extrinsic = api.tx.multisig[!isProxy ? 'asMulti' : 'approveAsMulti'](
		multisig.threshold,
		otherSignatoriesSorted,
		TIME_POINT,
		callData,
		0 as any
	);

	let blockHash = '';
	// eslint-disable-next-line consistent-return
	return new Promise<any>((resolve, reject) => {
		extrinsic
			.signAndSend(encodedInitiatorAddress, { tip }, async ({ status, txHash, events, dispatchError }) => {
				if (status.isInvalid) {
					console.log('Transaction invalid');
					// messageApi.error('Transaction invalid');
					setLoadingMessages('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
					// messageApi.loading('Transaction is ready');
					setLoadingMessages('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
					// messageApi.loading('Transaction has been broadcasted');
					setLoadingMessages('Transaction has been broadcasted');
				} else if (status.isInBlock) {
					blockHash = status.asInBlock.toHex();
					console.log('Transaction is in block');
					// messageApi.loading('Transaction is in block');
					setLoadingMessages('Transaction is in block');
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					const block = await api.rpc.chain.getBlock(blockHash);
					const blockNumber = block.block.header.number.toNumber();

					if (dispatchError) {
						if (dispatchError.isModule) {
							// for module errors, we have the section indexed, lookup
							const decoded = api.registry.findMetaError(dispatchError.asModule);
							const { docs, name, method, section } = decoded;

							console.log(`${section}.${name}: ${docs.join(' ')}`);

							// eslint-disable-next-line prefer-promise-reject-errors
							reject({
								callData,
								callHash,
								created_at: new Date(),
								error: `Error: ${section}.${method}\n${docs.join(' ')}`
							});
						} else {
							// Other, CannotLookup, BadOrigin, no extra info
							console.log(dispatchError.toString());
						}
					}

					events.forEach(({ event }) => {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});

							notify({
								args: {
									address,
									addresses: otherSignatoriesSorted,
									callHash,
									multisigAddress: multisig.address,
									network
								},
								network,
								triggerName: 'initMultisigTransfer'
							});

							resolve({
								callData,
								callHash,
								created_at: new Date()
							});

							// 6. store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
							addNewTransaction({
								amount: BN_ZERO,
								block_number: blockNumber,
								callData,
								callHash,
								from: multisig.address,
								network,
								note: ' ',
								to: ' '
							});

							sendNotificationToAddresses({
								addresses: otherSignatoriesSorted,
								link: `/transactions?tab=Queue#${tx.method.hash.toHex()}`,
								message: 'New transaction to sign',
								network,
								type: 'sent'
							});
						} else if (event.method === 'ExtrinsicFailed') {
							console.log('Transaction failed');

							const errorModule = (event.data as any)?.dispatchError?.asModule;
							if (!errorModule) {
								// eslint-disable-next-line prefer-promise-reject-errors
								reject({
									callData,
									callHash,
									created_at: new Date(),
									error: 'Transaction Failed'
								});
								return;
							}

							const { method, section, docs } = api.registry.findMetaError(errorModule);
							console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

							// eslint-disable-next-line prefer-promise-reject-errors
							reject({
								callData,
								callHash,
								created_at: new Date(),
								error: `Error: ${section}.${method}\n${docs.join(' ')}`
							});
						}
					});
				}
			})
			.catch((error) => {
				console.log(':( transaction failed');
				console.error('ERROR:', error);
				// eslint-disable-next-line prefer-promise-reject-errors
				reject({
					callData,
					callHash,
					created_at: new Date()
				});
			});
	});
};
export default executeTx;
