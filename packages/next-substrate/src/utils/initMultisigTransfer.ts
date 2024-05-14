// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sonarjs/no-duplicate-string */
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { formatBalance } from '@polkadot/util/format';
import { sortAddresses } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, NotificationStatus } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import addNewTransaction from './addNewTransaction';
import { calcWeight } from './calcWeight';
import getEncodedAddress from './getEncodedAddress';
import notify from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';
import parseDecodedValue from './parseDecodedValue';

export interface IMultiTransferResponse {
	callData: string;
	callHash: string;
	created_at: Date;
}

export interface IRecipientAndAmount {
	recipient: string;
	amount: BN;
}

interface Args {
	api: ApiPromise;
	recipientAndAmount: IRecipientAndAmount[];
	initiatorAddress: string;
	multisig: IMultisigAddress;
	network: string;
	note: string;
	transferKeepAlive: boolean;
	isProxy?: boolean;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
	transactionFields?: { category: string; subfields: { [subfield: string]: { name: string; value: string } } };
	attachments?: any;
	tip: BN;
	addToQueue: (obj: any) => void;
	selectedProxy: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function initMultisigTransfer({
	api,
	addToQueue,
	recipientAndAmount,
	initiatorAddress,
	multisig,
	isProxy,
	network,
	note,
	transferKeepAlive,
	setLoadingMessages,
	transactionFields,
	tip,
	selectedProxy
}: Args) {
	const encodedInitiatorAddress = getEncodedAddress(initiatorAddress, network);
	if (!encodedInitiatorAddress) throw new Error('Invalid initiator address');

	// promise to be resolved when transaction is finalized

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Define relevant constants
	// const MAX_WEIGHT = new Uint8Array([640000000]);
	const amounts = recipientAndAmount.map((o) => o.amount);
	const totalAmount = amounts.reduce((sum, item) => sum.add(item), new BN(0));
	const displayAmount = formatBalance(totalAmount);
	const recipientAddresses = recipientAndAmount.map(
		(item) => getEncodedAddress(item.recipient, network) || item.recipient
	);

	const encodedSignatories = multisig.signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if (!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});

	// remove initator address from signatories
	const otherSignatories = encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);
	const otherSignatoriesSorted = sortAddresses(otherSignatories, chainProperties[network].ss58Format);

	// 3. API calls - info is necessary for the timepoint
	const transferCalls: any[] = recipientAndAmount.map((item) => {
		const AMOUNT_TO_SEND = item.amount.toString();
		return transferKeepAlive
			? api.tx.balances.transferKeepAlive(getEncodedAddress(item.recipient, network) || item.recipient, AMOUNT_TO_SEND)
			: api.tx.balances.transfer(getEncodedAddress(item.recipient, network) || item.recipient, AMOUNT_TO_SEND);
	});

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	const transferBatchCall = api.tx.utility.batch([...transferCalls]);

	const callData = api.createType('Call', transferBatchCall.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	let tx: SubmittableExtrinsic<'promise'>;
	if (isProxy && multisig.proxy && selectedProxy) {
		tx = api.tx.proxy.proxy(selectedProxy, null, transferBatchCall);
	}

	let blockHash = '';

	return new Promise<IMultiTransferResponse>((resolve, reject) => {
		// 5. for transaction from proxy address
		if (isProxy && multisig.proxy) {
			api.tx.multisig
				.asMulti(multisig.threshold, otherSignatoriesSorted, TIME_POINT, tx, 0 as any)
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

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								// eslint-disable-next-line prefer-promise-reject-errors
								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
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
										address: initiatorAddress,
										addresses: otherSignatoriesSorted,
										callHash: tx.method.hash.toHex(),
										multisigAddress: multisig.address,
										network
									},
									network,
									triggerName: 'initMultisigTransfer'
								});

								resolve({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								addNewTransaction({
									amount: totalAmount,
									block_number: blockNumber,
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									from: selectedProxy,
									network,
									note,
									to: recipientAddresses,
									transactionFields
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
									queueNotification({
										header: 'Error!',
										message: 'Transaction Failed',
										status: NotificationStatus.ERROR
									});
									// eslint-disable-next-line prefer-promise-reject-errors
									reject({
										callData: tx.method.toHex(),
										callHash: tx.method.hash.toHex(),
										created_at: new Date(),
										error: 'Transaction Failed'
									});
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								// eslint-disable-next-line prefer-promise-reject-errors
								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
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
						callData: tx.method.toHex(),
						callHash: tx.method.hash.toHex(),
						created_at: new Date()
					});
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(
				`Sending ${displayAmount} from multisig: ${multisig.proxy} to ${recipientAddresses}, initiated by ${encodedInitiatorAddress}`
			);
		} else {
			// for transaction from multisig address
			api.tx.multisig
				.approveAsMulti(
					multisig.threshold,
					otherSignatoriesSorted,
					TIME_POINT,
					transferBatchCall.method.hash,
					MAX_WEIGHT as any
				)
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

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								// eslint-disable-next-line prefer-promise-reject-errors
								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
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

								addToQueue({
									approvals: [encodedInitiatorAddress],
									multisigAddress: multisig.address,
									multisigNetwork: network,
									multisigThreshold: multisig.threshold,
									totalAmount: parseDecodedValue({
										network,
										value: totalAmount.toString(),
										withUnit: false
									}),
									txData: transferBatchCall.method.toHex(),
									txFields: transactionFields,
									txHash: transferBatchCall.method.hash.toHex()
								});

								notify({
									args: {
										address: initiatorAddress,
										addresses: otherSignatoriesSorted,
										callHash: txHash,
										multisigAddress: multisig.address,
										network
									},
									network,
									triggerName: 'initMultisigTransfer'
								});

								resolve({
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								addNewTransaction({
									amount: totalAmount,
									block_number: blockNumber,
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
									from: multisig.address,
									network,
									note,
									to: recipientAddresses,
									transactionFields
								});

								sendNotificationToAddresses({
									addresses: otherSignatoriesSorted,
									link: `/transactions?tab=Queue#${transferBatchCall.method.hash.toHex()}`,
									message: 'New transaction to sign',
									network,
									type: 'sent'
								});
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');

								const errorModule = (event.data as any)?.dispatchError?.asModule;
								if (!errorModule) {
									queueNotification({
										header: 'Error!',
										message: 'Transaction Failed',
										status: NotificationStatus.ERROR
									});
									// eslint-disable-next-line prefer-promise-reject-errors
									reject({
										callData: transferBatchCall.method.toHex(),
										callHash: transferBatchCall.method.hash.toHex(),
										created_at: new Date(),
										error: 'Transaction Failed'
									});
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								// eslint-disable-next-line prefer-promise-reject-errors
								reject({
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
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
						callData: transferBatchCall.method.toHex(),
						callHash: transferBatchCall.method.hash.toHex(),
						created_at: new Date()
					});
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(
				`Sending ${displayAmount} from multisig: ${multisig.address} to ${recipientAddresses}, initiated by ${encodedInitiatorAddress}`
			);
			// }
			// console.log(`Submitted values : approveAsMulti(${multisig.threshold},
			// otherSignatories: ${JSON.stringify(otherSignatories)},
			// ${TIME_POINT},
			// ${call.method.hash},
			// ${MAX_WEIGHT})\n`
			// );
		}
	});
}
