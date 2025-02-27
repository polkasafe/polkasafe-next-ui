// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ETransactionType, ETransactionVariant } from '@common/enum/substrate';
import { Empty } from '@common/global-ui-components/Empty';
import { IDashboardTransaction, IMultisig } from '@common/types/substrate';
import { TransactionList } from '@substrate/app/(Main)/components/TransactionList';
import { useHistoryAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';

interface IQuickHistory {
	multisigs: Array<IMultisig>;
}

export function QuickHistory({ multisigs }: IQuickHistory) {
	const multisigIds = multisigs.map((multisig) => `${multisig.address}_${multisig.network}`);

	const [data] = useHistoryAtom();

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

	if (data.transactions.length === 0 && data.currentIndex === multisigIds.length - 1) {
		return <Empty description='No Transaction Found' />;
	}

	return (
		<TransactionList
			transactions={(data.transactions || []) as Array<IDashboardTransaction>}
			txType={ETransactionType.HISTORY_TRANSACTION}
			variant={ETransactionVariant.SIMPLE}
		/>
	);
}
