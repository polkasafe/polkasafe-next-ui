// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IDashboardTransaction } from '@common/types/substrate';
import { getQueueTransactions } from '@sdk/polkasafe-sdk/src';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@sdk/polkasafe-sdk/src/constants/pagination';
import { parseTransaction } from '@substrate/app/global/utils/parseTransaction';
import { useQuery } from '@tanstack/react-query';

interface IUseQueueTransaction {
	multisigIds: Array<string>;
	page?: number;
	limit?: number;
}

export function useQueueTransaction({
	multisigIds,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE
}: IUseQueueTransaction) {
	const handleQueueTransaction = async () => {
		const txData = await getQueueTransactions({ multisigs: multisigIds, page, limit });
		const transactionsData = txData?.data?.transactions || null;
		return (transactionsData?.map(parseTransaction) || []) as Array<IDashboardTransaction>;
	};

	return useQuery({
		queryKey: [`QueueTransaction${JSON.stringify({ multisigs: multisigIds, page, limit })}`],
		queryFn: handleQueueTransaction,
		enabled: multisigIds.length > 0
	});
}
