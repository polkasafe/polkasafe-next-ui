/* eslint-disable sonarjs/no-duplicate-string */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { sortAddresses } from '@polkadot/util-crypto';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, NotificationStatus, Wallet } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';

import Client from '@walletconnect/sign-client';
import getEncodedAddress from './getEncodedAddress';
import notify from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';
import wcSignTransaction from './wc_signTransaction';

interface Props {
	api: ApiPromise;
	network: string;
	multisig: IMultisigAddress;
	approvingAddress: string;
	recipientAddress?: string;
	callHash: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
	wc_client?: Client;
	wc_session_topic?: string;
	loggedInWallet?: Wallet;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function cancelMultisigTransfer({
	api,
	approvingAddress,
	callHash,
	recipientAddress,
	multisig,
	network,
	setLoadingMessages,
	wc_client,
	wc_session_topic,
	loggedInWallet
}: Props) {
	const encodedInitiatorAddress = getEncodedAddress(approvingAddress, network) || approvingAddress;

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// remove approving address address from signatories
	const encodedSignatories = multisig.signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if (!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});
	const otherSignatories = encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);
	const otherSignatoriesSorted = sortAddresses(otherSignatories, chainProperties[network].ss58Format);

	// 3. Retrieve and unwrap the timepoint
	const info = await api.query.multisig.multisigs(multisig.address, callHash);
	const TIME_POINT = info.unwrap().when;
	console.log(`Time point is: ${TIME_POINT}`);

	const tx = api.tx.multisig.cancelAsMulti(multisig.threshold, otherSignatoriesSorted, TIME_POINT, callHash);

	if (loggedInWallet === Wallet.WALLET_CONNECT && wc_client && wc_session_topic) {
		try {
			await wcSignTransaction(api, network, approvingAddress, tx, wc_client, wc_session_topic);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return new Promise<void>((resolve, reject) => {
		// 4. Send cancelAsMulti if last approval call
		if (loggedInWallet === Wallet.WALLET_CONNECT && wc_client && wc_session_topic) {
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
					console.log(`cancelAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					events.forEach(({ event }) => {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Cancelled.',
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
								triggerName: 'cancelledTransaction'
							});

							sendNotificationToAddresses({
								addresses: otherSignatoriesSorted,
								link: '',
								message: 'Transaction cancelled.',
								network,
								type: 'cancelled'
							});
							resolve();
						} else if (event.method === 'ExtrinsicFailed') {
							console.log('Transaction failed');

							const errorModule = (event.data as any)?.dispatchError?.asModule;
							if (!errorModule) {
								queueNotification({
									header: 'Error!',
									message: 'Failed to Cancel Transaction',
									status: NotificationStatus.ERROR
								});
								reject(new Error('Transaction Failed'));
								return;
							}

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
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
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
					console.log('Transaction is in block');
					setLoadingMessages('Transaction is in block');
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`cancelAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					events.forEach(({ event }) => {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Cancelled.',
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
								triggerName: 'cancelledTransaction'
							});

							sendNotificationToAddresses({
								addresses: otherSignatoriesSorted,
								link: '',
								message: 'Transaction cancelled.',
								network,
								type: 'cancelled'
							});
							resolve();
						} else if (event.method === 'ExtrinsicFailed') {
							console.log('Transaction failed');

							const errorModule = (event.data as any)?.dispatchError?.asModule;
							if (!errorModule) {
								queueNotification({
									header: 'Error!',
									message: 'Failed to Cancel Transaction',
									status: NotificationStatus.ERROR
								});
								reject(new Error('Transaction Failed'));
								return;
							}

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
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
		}
		const hasRecipient = recipientAddress ? `to ${recipientAddress}` : '';

		console.log(`Cancel tx from ${multisig.address} ${hasRecipient}`);
		console.log(
			`Submitted values: cancelAsMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(
				otherSignatoriesSorted,
				null,
				2
			)}, ${TIME_POINT}, ${callHash})\n`
		);
	});
}
