// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@common/enum/substrate';
import { ITransaction } from '@common/types/substrate';
import { useQuery } from '@tanstack/react-query';
import { getQueueDetailsForMultisig } from '@sdk/polkasafe-sdk/src/get-queue-detail';

interface IUseQueueTransaction {
	extrinsicBlockWithIndex: string;
	network: ENetwork;
}

export function useQueueDetails({ extrinsicBlockWithIndex, network }: IUseQueueTransaction) {
	const handleQueueDetails = async () => {
		try {
			const { data: tx, error } = (await getQueueDetailsForMultisig({ extrinsicBlockWithIndex, network })) as {
				data: ITransaction;
				error: string | null;
			};
			if (error) {
				throw new Error(error);
			}
			return tx;
		} catch (error) {
			console.log('error', error);
		}

		return null;
	};

	return useQuery({
		queryKey: [`QueueDetails${JSON.stringify({ extrinsicBlockWithIndex, network })}`],
		queryFn: handleQueueDetails,
		enabled: !!extrinsicBlockWithIndex && !!network
	});
}
