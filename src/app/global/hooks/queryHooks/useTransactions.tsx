// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ETransactionType } from '@common/enum/substrate';
import { IDashboardTransaction } from '@common/types/substrate';
import { getHistoryTransactions, getQueueTransactions } from '@sdk/polkasafe-sdk/src';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@sdk/polkasafe-sdk/src/constants/pagination';
import { parseTransaction } from '@substrate/app/global/utils/parseTransaction';
import { useQuery } from '@tanstack/react-query';

interface IUseQueueTransaction {
	multisigId: string;
	page?: number;
	limit?: number;
	type: ETransactionType;
}

export function useTransactions({
	multisigId,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE,
	type
}: IUseQueueTransaction) {
	const handleQueueTransaction = async () => {
		const txData = await getQueueTransactions({ multisigs: [multisigId], page, limit });
		const transactionsData = txData?.data?.transactions || null;
		return (transactionsData?.map(parseTransaction) || []) as Array<IDashboardTransaction>;
	};

	const handleHistoryTransaction = async () => {
		const txData = await getHistoryTransactions({ multisigs: [multisigId], page, limit });
		const transactionsData = txData?.data?.transactions || [];
		return transactionsData?.map(parseTransaction) as Array<IDashboardTransaction>;
	};

	return useQuery({
		queryKey:
			type === ETransactionType.HISTORY_TRANSACTION
				? [`HistoryTransaction${JSON.stringify({ multisigs: [multisigId], page, limit })}`]
				: [`QueueTransaction${JSON.stringify({ multisigs: [multisigId], page, limit })}`],
		queryFn: type === ETransactionType.HISTORY_TRANSACTION ? handleHistoryTransaction : handleQueueTransaction,
		enabled: !!multisigId,
		refetchOnWindowFocus: false
	});
}
