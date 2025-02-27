// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@common/enum/substrate';
import { IDashboardTransaction } from '@common/types/substrate';
import { getQueueTransactions } from '@sdk/polkasafe-sdk/src';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@sdk/polkasafe-sdk/src/constants/pagination';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { parseTransaction } from '@substrate/app/global/utils/parseTransaction';
import { useQuery } from '@tanstack/react-query';

interface IUseQueueTransaction {
	multisigId: string;
	page?: number;
	limit?: number;
}

// TX DATA

// {
//     "txHash": "0x98138c29a7661deaf5c2c994321b130cbcdeb8f7926a9b29fd4c63b86c57a2f6",
//     "from": "0x653d80f2e7819f78eb5dac75720ce9e1ddf045b0",
//     "txData": {
//       "when": {
//         "height": "18,954,027",
//         "index": "1"
//       },
//       "deposit": "1,012",
//       "depositor": "0xc289ac9f7a28b4eebaa24c145e8e9213f90c1d20",
//       "approvals": [
//         "0xc289ac9f7a28b4eebaa24c145e8e9213f90c1d20"
//       ]
//     }
//   }

export function useQueueTransaction({
	multisigId,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE
}: IUseQueueTransaction) {
	const { getApi } = useAllAPI();

	const handleQueueTransaction = async () => {
		const network = multisigId.split('_')[1] as ENetwork;
		const apiAtomValue = getApi(network);
		console.log('apiAtomValue', apiAtomValue?.apiReady);
		console.log('apiAtomValue?.api', apiAtomValue?.api);
		if (!apiAtomValue?.api) {
			return [];
		}

		const api = apiAtomValue.api;
		console.log('api', multisigId);
		const transactionData: Array<IDashboardTransaction> = [];
		const address = multisigId.split('_')[0];
		console.log('address', address);
		try {
			const data = await (api.query.multisig.multisigs.entries as any)(address);
			const multisigData = data.map((item: any) => ({
				txHash: item[0].toHuman()[1],
				from: item[0].toHuman()[0],
				txData: item[1].toHuman()
			}));
			console.log('multisigData', JSON.stringify(multisigData));

			const extrinsicBlockWithIndex = multisigData.map(
				(item: any) => `${item.txData.when.height}-${item.txData.when.index}`
			);
			console.log('extrinsicBlockWithIndex:::::', extrinsicBlockWithIndex);

			// convert data to IDashboardTransaction
			multisigData.forEach((item: any) => {
				transactionData.push({
					callHash: item.txHash,
					callData: '',
					amountToken: '0',
					network: network,
					multisigAddress: item.from,
					from: item.from,
					approvals: item.txData.approvals,
					initiator: item.txData.depositor,
					multiId: `${item.from}-${network}`,
					blockNumber: item.txData.when.height.split(',').join(''),
					extrinsicIndex: item.txData.when.index,
					createdAt: new Date()
				});
			});
		} catch (error) {
			console.log('error', error);
		}

		console.log('transactionData:::::', transactionData);

		// get the block number and index data

		return (transactionData || []) as Array<IDashboardTransaction>;
	};

	return useQuery({
		queryKey: [`TestQueueTransaction${JSON.stringify({ multisigId, page, limit })}`],
		queryFn: handleQueueTransaction,
		enabled: !!multisigId
	});
}
