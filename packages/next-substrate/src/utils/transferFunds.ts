/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sort-keys */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from '@next-common/global/networkConstants';
import { NotificationStatus, Wallet } from '@next-common/types';
import queueNotification from '@next-common/ui-components/QueueNotification';
import Client from '@walletconnect/sign-client';
import wcSignTransaction from './wc_signTransaction';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	amount: BN;
	api: ApiPromise;
	network: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
	setTxnHash?: React.Dispatch<React.SetStateAction<string>>;
	client?: Client;
	topic?: string;
	loggedInWallet?: Wallet;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function transferFunds({
	api,
	setTxnHash,
	network,
	recepientAddress,
	senderAddress,
	amount,
	setLoadingMessages,
	client,
	loggedInWallet,
	topic
}: Props) {
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const AMOUNT_TO_SEND = amount;
	const displayAmount = formatBalance(AMOUNT_TO_SEND); // 2.0000 WND

	const tx = api.tx.balances.transferKeepAlive(recepientAddress, AMOUNT_TO_SEND);

	if (loggedInWallet === Wallet.WALLET_CONNECT && client && topic) {
		try {
			await wcSignTransaction(api, network, senderAddress, tx, client, topic);
		} catch (e) {
			console.log(e);
			return undefined;
		}
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return new Promise<void>((resolve, reject) => {
		if (loggedInWallet === Wallet.WALLET_CONNECT && client && topic) {
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
					console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);
					setTxnHash?.(`${txHash}`);

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
				console.log(':( transaction failed');
				console.error('ERROR:', error);
				reject();
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
		} else {
			tx.signAndSend(senderAddress, async ({ status, txHash, events }) => {
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
					console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);
					setTxnHash?.(`${txHash}`);

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
				console.log(':( transaction failed');
				console.error('ERROR:', error);
				reject();
				queueNotification({
					header: 'Failed!',
					message: error.message,
					status: NotificationStatus.ERROR
				});
			});
		}

		console.log(`Sending ${displayAmount} from ${senderAddress} to ${recepientAddress}`);
	});
}
