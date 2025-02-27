// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDashboardTransaction } from '@common/types/substrate';
import { ENetwork, ETransactionOptions, ETransactionType, ETransactionVariant } from '@common/enum/substrate';
import { useSearchParams } from 'next/navigation';
import TransactionRow from '@substrate/app/(Main)/components/TransactionList/components/TransactionRow';
import { twMerge } from 'tailwind-merge';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

interface ITransactionList {
	transactions: Array<IDashboardTransaction>;
	txType: ETransactionType;
	className?: string;
	variant: ETransactionVariant;
}

const columns = [
	{
		title: 'Transaction',
		variant: ETypographyVariants.p
	},
	{
		title: 'Amount',
		variant: ETypographyVariants.p
	},
	{
		title: 'From',
		variant: ETypographyVariants.p
	},
	{
		title: 'To',
		variant: ETypographyVariants.p
	},
	{
		title: 'Action',
		variant: ETypographyVariants.p
	}
];

export function TransactionList({ transactions = [], txType, className, variant }: ITransactionList) {
	const multisig = useSearchParams().get('_multisig');
	const network = useSearchParams().get('_network') as ENetwork;
	const isSimple = variant === ETransactionVariant.SIMPLE;
	console.log('unfiltered', transactions);
	return (
		<div className='h-full'>
			{isSimple && (
				<div className='flex bg-bg-secondary my-1 p-3 rounded-lg mr-1'>
					{columns.map((column) => (
						<Typography
							key={column.title}
							variant={column.variant}
							className='basis-1/5 text-base'
						>
							{column.title}
						</Typography>
					))}
				</div>
			)}
			<div
				className={
					isSimple
						? 'max-h-72 overflow-x-hidden overflow-y-auto flex flex-col gap-3'
						: twMerge('flex flex-col gap-3 border-none', className)
				}
			>
				{transactions &&
					transactions.map((transaction) => (
						<TransactionRow
							blockNumber={transaction.blockNumber?.toString() || ''}
							extrinsicIndex={transaction.extrinsicIndex || 0}
							multiId={transaction.multiId}
							callHash={transaction.callHash}
							callData={transaction.callData}
							key={`${transaction.callHash}`}
							createdAt={new Date(transaction.createdAt)}
							to={transaction.to as string}
							network={transaction.network as ENetwork}
							amountToken={transaction.amountToken}
							from={transaction.from || transaction.multisigAddress}
							type={
								transaction.to === transaction.multisigAddress ? ETransactionOptions.RECEIVED : ETransactionOptions.SENT
							}
							transactionType={txType}
							multisig={transaction.multisigAddress}
							approvals={transaction.approvals.map((approval) => approval.toLowerCase())}
							variant={variant}
							initiator={transaction.initiator || ''}
							transactionFields={transaction.transactionFields}
						/>
					))}
			</div>
		</div>
	);
}
