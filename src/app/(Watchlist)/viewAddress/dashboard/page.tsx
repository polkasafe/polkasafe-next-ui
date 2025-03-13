// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ISearchParams } from '@common/types/substrate';
import { ETransactionTab } from '@common/enum/substrate';
import { getMultisigDataAndTransactions } from '@substrate/app/(Main)/dashboard/ssr-actions/getMultisigDataAndTransactions';
import WatchList from '@substrate/app/(Watchlist)/viewAddress/components/Watchlist';

interface IWatchList {
	searchParams: ISearchParams;
}

async function WatchListPage({ searchParams }: IWatchList) {
	const { _multisig, _network, _tab } = searchParams;
	const { multisig } = await getMultisigDataAndTransactions(_multisig, _network);
	if (!multisig) {
		throw new Error('Multisig not found');
	}
	return (
		<WatchList
			multisig={multisig}
			tab={(_tab as ETransactionTab) || ETransactionTab.QUEUE}
		/>
	);
}

export default WatchListPage;
