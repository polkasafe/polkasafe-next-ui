// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sonarjs/no-duplicate-string */
import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { sortAddresses } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, NotificationStatus, QrState, Wallet } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import Client from '@walletconnect/sign-client';
import addNewTransaction from './addNewTransaction';
import { calcWeight } from './calcWeight';
import getEncodedAddress from './getEncodedAddress';
import getMultisigInfo from './getMultisigInfo';
import notify from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';
import updateTransactionNote from './updateTransactionNote';
import wcSignTransaction from './wc_signTransaction';
import vaultSignTransaction from './vault_signTransaction';

interface Args {
	api: ApiPromise;
	approvals: string[];
	network: string;
	multisig: IMultisigAddress;
	callDataHex: string;
	callHash: string;
	amount?: BN;
	approvingAddress: string;
	recipientAddress?: string;
	note: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
	wc_client?: Client;
	wc_session_topic?: string;
	loggedInWallet?: Wallet;
	setQrState: React.Dispatch<React.SetStateAction<QrState>>;
	setOpenSignWithVaultModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function approveMultisigTransfer({
	amount,
	approvals,
	api,
	approvingAddress,
	callDataHex,
	callHash,
	recipientAddress,
	multisig,
	network,
	note,
	setLoadingMessages,
	wc_client,
	wc_session_topic,
	loggedInWallet,
	setQrState,
	setOpenSignWithVaultModal
}: Args) {
	const encodedInitiatorAddress = getEncodedAddress(approvingAddress, network) || approvingAddress;

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Set relevant vars
	const ZERO_WEIGHT = new Uint8Array(0);
	let WEIGHT: any = ZERO_WEIGHT;

	// remove approving address address from signatories
	const encodedSignatories = multisig.signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if (!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});
	const otherSignatories = encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);
	const otherSignatoriesSorted = sortAddresses(otherSignatories, chainProperties[network].ss58Format);

	if (!callDataHex) return undefined;

	const callData = api.createType('Call', callDataHex);
	const { weight } = await calcWeight(callData, api);
	WEIGHT = weight;
	if (!callData.hash.eq(callHash)) return undefined;

	const multisigInfos = await getMultisigInfo(multisig.address, api);
	const [, multisigInfo] = multisigInfos?.find(([h]) => h.eq(callHash)) || [null, null];

	if (!multisigInfo) {
		console.log('No multisig info found');
		return undefined;
	}

	console.log(`Time point is: ${multisigInfo?.when}`);

	const numApprovals = multisigInfo.approvals.length;

	let blockHash = '';

	const tx =
		numApprovals < multisig.threshold - 1
			? api.tx.multisig.approveAsMulti(
					multisig.threshold,
					otherSignatoriesSorted,
					multisigInfo.when,
					callHash,
					ZERO_WEIGHT
				)
			: api.tx.multisig.asMulti(
					multisig.threshold,
					otherSignatoriesSorted,
					multisigInfo.when,
					callDataHex,
					WEIGHT as any
				);

	if (loggedInWallet === Wallet.WALLET_CONNECT && wc_client && wc_session_topic) {
		try {
			await wcSignTransaction(api, network, approvingAddress, tx, wc_client, wc_session_topic);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}

	if (loggedInWallet === Wallet.POLKADOT_VAULT) {
		try {
			setOpenSignWithVaultModal(true);
			await vaultSignTransaction(api, network, approvingAddress, tx, setQrState);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}

	return new Promise<void>((resolve, reject) => {
		// 5. Send asMulti if last approval call
		if (numApprovals < multisig.threshold - 1) {
			if (
				(loggedInWallet === Wallet.WALLET_CONNECT && wc_client && wc_session_topic) ||
				loggedInWallet === Wallet.POLKADOT_VAULT
			) {
				tx.send(async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						setLoadingMessages('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						setLoadingMessages('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						setLoadingMessages('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						console.log('Transaction is in block');
						setLoadingMessages('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						events.forEach(({ event }) => {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});
								resolve();
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');

								const errorModule = (event.data as any)?.dispatchError?.asModule;
								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});
								reject(new Error(`Error: ${section}.${method}\n${docs.join(' ')}`));
							}
						});
					}
				}).catch((error) => {
					console.log(error);
					reject(error);
				});
			} else {
				tx.signAndSend(encodedInitiatorAddress, { withSignedTransaction: true }, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						setLoadingMessages('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						setLoadingMessages('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						setLoadingMessages('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						console.log('Transaction is in block');
						setLoadingMessages('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						events.forEach(({ event }) => {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});
								resolve();
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');

								const errorModule = (event.data as any)?.dispatchError?.asModule;
								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});
								reject(new Error(`Error: ${section}.${method}\n${docs.join(' ')}`));
							}
						});
					}
				}).catch((error) => {
					console.log(error);
					reject(error);
				});
			}
		} else if (
			(loggedInWallet === Wallet.WALLET_CONNECT && wc_client && wc_session_topic) ||
			loggedInWallet === Wallet.POLKADOT_VAULT
		) {
			tx.send(async ({ status, txHash, events }) => {
				if (status.isInvalid) {
					console.log('Transaction invalid');
					setLoadingMessages('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
					setLoadingMessages('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
					setLoadingMessages('Transaction has been broadcasted');
				} else if (status.isInBlock) {
					blockHash = status.asInBlock.toHex();
					console.log('Transaction is in block');
					setLoadingMessages('Transaction is in block');
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`asMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					const block = await api.rpc.chain.getBlock(blockHash);
					const blockNumber = block.block.header.number.toNumber();

					events.forEach(({ event }) => {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});

							notify({
								args: {
									address: approvingAddress,
									addresses: otherSignatoriesSorted,
									callHash,
									multisigAddress: multisig.address,
									network
								},
								network,
								triggerName: 'executedTransaction'
							});

							resolve();

							// update note for transaction history
							if (note)
								updateTransactionNote({ callHash: txHash.toHex(), multisigAddress: multisig.address, network, note });

							addNewTransaction({
								amount: amount || new BN(0),
								approvals: approvals.length > 0 ? [...approvals, approvingAddress] : [],
								block_number: blockNumber,
								callData: callDataHex,
								callHash: txHash.toHex(),
								from: multisig.address,
								network,
								note,
								to: recipientAddress || ''
							});

							sendNotificationToAddresses({
								addresses: otherSignatoriesSorted,
								link: `/transactions?tab=History#${txHash.toHex()}`,
								message: 'Transaction Executed!',
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
								reject(new Error('Transaction Failed'));
								return;
							}

							const { method, section, docs } = api.registry.findMetaError(errorModule);
							console.log(`Error: ${section}.${method}\n${docs?.join(' ')}`);

							queueNotification({
								header: `Error! ${section}.${method}`,
								message: `${docs.join(' ')}`,
								status: NotificationStatus.ERROR
							});
							reject(new Error(`Error: ${section}.${method}\n${docs.join(' ')}`));
						}
					});
				}
			}).catch((error) => {
				console.log(error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				reject(error);
			});
		} else {
			tx.signAndSend(encodedInitiatorAddress, async ({ status, txHash, events }) => {
				if (status.isInvalid) {
					console.log('Transaction invalid');
					setLoadingMessages('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
					setLoadingMessages('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
					setLoadingMessages('Transaction has been broadcasted');
				} else if (status.isInBlock) {
					blockHash = status.asInBlock.toHex();
					console.log('Transaction is in block');
					setLoadingMessages('Transaction is in block');
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`asMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					const block = await api.rpc.chain.getBlock(blockHash);
					const blockNumber = block.block.header.number.toNumber();

					events.forEach(({ event }) => {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});

							notify({
								args: {
									address: approvingAddress,
									addresses: otherSignatoriesSorted,
									callHash,
									multisigAddress: multisig.address,
									network
								},
								network,
								triggerName: 'executedTransaction'
							});

							resolve();

							// update note for transaction history
							if (note)
								updateTransactionNote({ callHash: txHash.toHex(), multisigAddress: multisig.address, network, note });

							addNewTransaction({
								amount: amount || new BN(0),
								approvals: approvals.length > 0 ? [...approvals, approvingAddress] : [],
								block_number: blockNumber,
								callData: callDataHex,
								callHash: txHash.toHex(),
								from: multisig.address,
								network,
								note,
								to: recipientAddress || ''
							});

							sendNotificationToAddresses({
								addresses: otherSignatoriesSorted,
								link: `/transactions?tab=History#${txHash.toHex()}`,
								message: 'Transaction Executed!',
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
								reject(new Error('Transaction Failed'));
								return;
							}

							const { method, section, docs } = api.registry.findMetaError(errorModule);
							console.log(`Error: ${section}.${method}\n${docs?.join(' ')}`);

							queueNotification({
								header: `Error! ${section}.${method}`,
								message: `${docs.join(' ')}`,
								status: NotificationStatus.ERROR
							});
							reject(new Error(`Error: ${section}.${method}\n${docs.join(' ')}`));
						}
					});
				}
			}).catch((error) => {
				console.log(error);
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
				reject(error);
			});
		}

		// console.log(`Sending ${displayAmount} from ${multisig.address} to ${recipientAddress}`);
		console.log(
			`Submitted values: asMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(
				otherSignatoriesSorted,
				null,
				2
			)}, ${multisigInfo?.when}, ${callHash}, ${WEIGHT})\n`
		);
	});
}
