/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sort-keys */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { NotificationStatus } from '@common/types/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import { SubmittableExtrinsic } from '@polkadot/api/types';

interface Props {
	api: ApiPromise;
	network: string;
	setLoadingMessages?: React.Dispatch<React.SetStateAction<string>>;
	setTxnHash?: React.Dispatch<React.SetStateAction<string>>;
	tx: SubmittableExtrinsic<'promise', any>;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function sendTxnWithSignature({ api, setTxnHash, network, setLoadingMessages, tx }: Props) {
	// eslint-disable-next-line sonarjs/cognitive-complexity
	return new Promise<string>((resolve, reject) => {
		tx.send(async ({ status, txHash, events }) => {
			if (status.isInvalid) {
				console.log('Transaction invalid');
				setLoadingMessages?.('Transaction invalid');
			} else if (status.isReady) {
				console.log('Transaction is ready');
				setLoadingMessages?.('Transaction is ready');
			} else if (status.isBroadcast) {
				console.log('Transaction has been broadcasted');
				setLoadingMessages?.('Transaction has been broadcasted');
			} else if (status.isInBlock) {
				console.log('Transaction is in block');
				setLoadingMessages?.('Transaction is in block');
			} else if (status.isFinalized) {
				console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
				console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);
				setTxnHash?.(`${txHash}`);

				events.forEach(({ event }: { event: any }) => {
					if (event.method === 'ExtrinsicSuccess') {
						// queueNotification({
						// header: 'Success!',
						// message: 'Transaction Successful.',
						// status: NotificationStatus.SUCCESS
						// });
						resolve(txHash);
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
			console.error('error in sendTxnWithSignature:', error);
			reject();
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		});
	});
}
