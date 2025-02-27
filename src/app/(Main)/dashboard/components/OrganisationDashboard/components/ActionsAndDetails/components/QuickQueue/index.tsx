// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IDashboardTransaction, IMultisig } from '@common/types/substrate';
import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { ETransactionType, ETransactionVariant } from '@common/enum/substrate';
import { Empty } from '@common/global-ui-components/Empty';
import { useQueueAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { TransactionList } from '@substrate/app/(Main)/components/TransactionList';

interface IQuickHistory {
	multisigs: Array<IMultisig>;
}

export function QuickQueue({ multisigs }: IQuickHistory) {
	const multisigIds = multisigs.map((multisig) => `${multisig.address}_${multisig.network}`);

	const [data] = useQueueAtom();

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	if (!data?.transactions) {
		return <Skeleton />;
	}

	// if (data.transactions.length === 0 && data.currentIndex !== multisigIds.length - 1) {
	// 	return <Skeleton />;
	// }

	if (data.transactions.length === 0 && data.currentIndex === multisigIds.length - 1) {
		return <Empty description='No Transaction Found' />;
	}

	console.log('data.transactions', data.transactions);
	return (
		<TransactionList
			transactions={(data.transactions || []) as Array<IDashboardTransaction>}
			txType={ETransactionType.QUEUE_TRANSACTION}
			variant={ETransactionVariant.SIMPLE}
		/>
	);
}
