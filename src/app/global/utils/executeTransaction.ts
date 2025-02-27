// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ISubstrateExecuteProps } from '@common/types/substrate';

/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-promise-reject-errors */
const TX_FAILED = 'Transaction failed';
export const executeTx = async ({
	api,
	apiReady,
	network,
	tx,
	address,
	params = {},
	errorMessageFallback,
	onSuccess,
	onFailed,
	setStatus
}: ISubstrateExecuteProps) => {
	let success = false;
	return new Promise<string>((resolve, reject) => {
		if (!api || !apiReady || !tx) return;

		tx.signAndSend(address, params, async ({ status, events, txHash, txIndex }) => {
			if (status.isInvalid) {
				console.log('Transaction invalid');
				setStatus?.('Transaction invalid');
			} else if (status.isReady) {
				console.log('Transaction is ready');
				setStatus?.('Transaction is ready');
			} else if (status.isBroadcast) {
				console.log('Transaction has been broadcasted');
				setStatus?.('Transaction has been broadcasted');
			} else if (status.isInBlock) {
				console.log('Transaction is in block');
				setStatus?.('Transaction is in block');
				const blockHash = status.asInBlock.toString();
				// eslint-disable-next-line no-restricted-syntax
				for (const { event } of events) {
					if (event.method === 'ExtrinsicSuccess') {
						success = true;
						resolve(txHash.toString());
					} else if (event.method === 'ExtrinsicFailed') {
						setStatus?.(TX_FAILED);
						console.log(TX_FAILED);
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const dispatchError = (event.data as any)?.dispatchError;

						if (dispatchError?.isModule) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const errorModule = (event.data as any)?.dispatchError?.asModule;
							const { method, section, docs } = api.registry.findMetaError(errorModule);
							const errorMessageFallbackString = `${section}.${method} : ${docs.join(' ')}`;
							console.log(errorMessageFallbackString, 'error module');
							reject(`${errorMessageFallbackString} error module`);
						} else if (dispatchError?.isToken) {
							console.log(`${dispatchError.type}.${dispatchError.asToken.type}`);
							reject(`${dispatchError.type}.${dispatchError.asToken.type}`);
						} else {
							reject(`${dispatchError.type}`);
						}
					}
				}
			} else if (status.isFinalized) {
				console.log(success, 'checking success');
				if (success) {
					console.log('sending success');
					console.log(txHash.toHex(), txHash.toString(), txHash);
					onSuccess?.({ txHash: txHash.toHex() || txHash.toString() || txHash, txIndex });
				}
				console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
				console.log(`tx: https://${network}.subscan.io/extrinsic/${txHash}`);
			}
		}).catch((error: unknown) => {
			console.log(':( transaction failed');
			setStatus?.(':( transaction failed');
			reject(error?.toString?.() || errorMessageFallback);
			console.error('ERROR:', error);
			onFailed?.(error?.toString?.() || errorMessageFallback);
		});
	});
};
