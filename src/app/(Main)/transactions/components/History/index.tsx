// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ETransactionType, ETransactionVariant, ETxnType, ETxType } from '@common/enum/substrate';
import { Empty } from '@common/global-ui-components/Empty';
import Modal from '@common/global-ui-components/Modal';
import { IDashboardTransaction, IMultisig } from '@common/types/substrate';
import { TransactionList } from '@substrate/app/(Main)/components/TransactionList';
import ExportTransactionsHistory, { EExportType } from '@substrate/app/(Main)/transactions/components/ExportTransactionsHistory';
import { useHistoryAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

interface IHistory {
	multisigs: Array<IMultisig>;
	openExportModal: boolean;
	setOpenExportModal: React.Dispatch<React.SetStateAction<boolean>>;
	exportType: EExportType;
}

export function History({ multisigs, setOpenExportModal, openExportModal, exportType }: IHistory) {
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
		return <Skeleton active />;
	}

	if (data.transactions.length === 0 && data.currentIndex !== multisigIds.length - 1) {
		return <Skeleton active />;
	}

	if (data.transactions.length === 0 && data.currentIndex === multisigIds.length - 1) {
		return <Empty description='No Transaction Found' />;
	}
	return (
		<>
		<Modal
				onCancel={() => setOpenExportModal(false)}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>
						Export Transaction History For {exportType}
					</h3>
				}
				open={openExportModal}
			>
				<ExportTransactionsHistory
					exportType={exportType}
					historyTxns={data.transactions?.map((txn) => {
						const type = txn.from === txn.multisigAddress ? 'Sent' : 'Received';
						const amount = !Number.isNaN(txn.amountToken)
							? Number(txn.amountToken).toFixed(4)
							: '0'
						return {
							amount: type === 'Sent' ? `-${amount}` : amount,
							callhash: txn.callHash,
							date: txn.createdAt,
							from: txn.from,
							network: txn.network,
							token: txn.network
						};
					})}
					closeModal={() => setOpenExportModal(false)}
				/>
			</Modal>
			<TransactionList
				transactions={(data.transactions || []) as Array<IDashboardTransaction>}
				txType={ETransactionType.HISTORY_TRANSACTION}
				variant={ETransactionVariant.DETAILED}
			/>
		</>
	);
}
