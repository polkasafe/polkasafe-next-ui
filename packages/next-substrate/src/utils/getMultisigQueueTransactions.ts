// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { IQueueItem } from '@next-common/types';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { responseMessages } from '@next-common/constants/response_messages';

interface IResponse {
	error?: string | null;
	data: IQueueItem[];
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function getMultisigQueueTransactions(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number
): Promise<IResponse> {
	const returnValue: IResponse = {
		data: [],
		error: ''
	};

	try {
		const res = await fetch(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			body: JSON.stringify({
				account: multisigAddress,
				page: page - 1 || 0, // pages start from 0
				row: entries || 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data: response } = await res.json();

		const queueItems: IQueueItem[] = [];

		if (response && response.multisig?.length) {
			// eslint-disable-next-line no-restricted-syntax
			for (const multisigQueueItem of response.multisig) {
				// eslint-disable-next-line no-continue
				if (multisigQueueItem.status !== 'Approval') continue;

				// eslint-disable-next-line no-await-in-loop
				const multisigRes = await fetch(`https://${network}.api.subscan.io/api/scan/multisig`, {
					body: JSON.stringify({
						call_hash: multisigQueueItem.call_hash,
						multi_id: multisigQueueItem.multi_id
					}),
					headers: SUBSCAN_API_HEADERS,
					method: 'POST'
				});
				// eslint-disable-next-line no-await-in-loop
				const { data: multisigData } = await multisigRes.json();

				const newQueueItem: IQueueItem = {
					callData: '',
					callHash: multisigQueueItem.call_hash,
					created_at: dayjs(
						// eslint-disable-next-line no-unsafe-optional-chaining
						multisigData?.process?.reduce((min: any, current: any) => {
							if (current.timestamp && current.timestamp < min) return current.timestamp;
							return min;
						}, Number.MAX_SAFE_INTEGER) * 1000
					).toDate(),
					network,
					note: '',
					notifications: {},
					status: multisigQueueItem.status,
					threshold: multisigQueueItem.threshold,
					totalAmount: '',
					transactionFields: { category: 'none', subfields: {} }
				};

				queueItems.push(newQueueItem);
			}
		}

		returnValue.data = queueItems;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}
