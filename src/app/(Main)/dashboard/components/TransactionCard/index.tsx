// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ITransaction } from '@common/types/substrate';

export default function TransactionCard({ transactions }: { transactions: Array<ITransaction> }) {
	console.log(transactions);
	return (
		<div>
			{transactions.map((transaction) => (
				<p>{transaction.callHash}</p>
			))}
		</div>
	);
}
