// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IDashboardTransaction } from '@common/types/substrate';
import { getHistoryTransactions } from '@sdk/polkasafe-sdk/src';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@sdk/polkasafe-sdk/src/constants/pagination';
import { parseTransaction } from '@substrate/app/global/utils/parseTransaction';
import { useQuery } from '@tanstack/react-query';

interface IUseHistoryTransaction {
	multisigIds: Array<string>;
	page?: number;
	limit?: number;
}

export function useHistoryTransaction({
	multisigIds,
	page = DEFAULT_PAGE,
	limit = DEFAULT_PAGE_SIZE
}: IUseHistoryTransaction) {
	const handleFetchHistoryTransaction = async () => {
		const txData = await getHistoryTransactions({ multisigs: multisigIds, page, limit });
		const transactionsData = txData?.data?.transactions || [];
		return transactionsData?.map(parseTransaction) as Array<IDashboardTransaction>;
	};
	return useQuery({
		queryKey: [`getOrganisationTransactions${JSON.stringify({ multisigs: multisigIds, page, limit })}`],
		queryFn: handleFetchHistoryTransaction,
		enabled: multisigIds.length > 0,
		refetchOnWindowFocus: false
	});
}
