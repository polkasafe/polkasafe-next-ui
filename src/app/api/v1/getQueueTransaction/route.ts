// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import { IDBMultisig, ITransaction } from '@common/types/substrate';
import { onChainQueueTransaction } from '@substrate/app/api/api-utils/onChainQueueTransaction';
import { ENetwork } from '@common/enum/substrate';

const getMultisigTransactions = async (multisigs: Array<IDBMultisig>, limit: number, page: number) => {
	const payload: Array<ITransaction> = [];

	for (const { address, network } of multisigs.filter((a) => Boolean(a))) {
		const {
			data: { transactions: historyItemsArr },
			error: historyItemsError
		} = await onChainQueueTransaction(address, network, Number(limit), Number(page));
		if (historyItemsError || !historyItemsArr) {
			console.log(`Error in  Multisig - ${address} Network - ${network}:`, {
				err: historyItemsError
			});
		}
		if (historyItemsArr) {
			payload.push(...historyItemsArr);
		}
	}

	// multisigs.forEach(async ({ address, network }: { address: string; network: ENetwork }) => {
	// 	const {
	// 		data: { transactions: historyItemsArr },
	// 		error: historyItemsError
	// 	} = await onChainQueueTransaction(address, network, Number(limit), Number(page));
	// 	if (historyItemsError || !historyItemsArr) {
	// 		console.log(`Error in  Multisig - ${address} Network - ${network}:`, {
	// 			err: historyItemsError
	// 		});
	// 	}
	// 	if (historyItemsArr) {
	// 		payload.push(...historyItemsArr);
	// 	}
	// });
	// return Promise.all(payload);
	return payload;
};

// Queue transaction for multisig
export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { multisigs, limit, page } = await req.json();
		if (!multisigs || Number.isNaN(limit) || Number.isNaN(page)) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (Number(limit) > 100 || Number(limit) <= 0) {
			return NextResponse.json({ error: ResponseMessages.INVALID_LIMIT }, { status: 400 });
		}
		if (Number(page) <= 0) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PAGE }, { status: 400 });
		}

		const encodedMultisigs = multisigs.map((item: string) => {
			const [address, network] = item.split('_');
			const encodeAddress = getEncodedAddress(address, network as ENetwork);
			if (!encodeAddress) {
				return null;
			}
			return {
				address: encodeAddress,
				network
			};
		});

		const allTxns = await getMultisigTransactions(encodedMultisigs, limit, page);

		return NextResponse.json(
			{
				data: { transactions: allTxns },
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
