import NoTransactionsHistory from '@next-common/assets/icons/no-transaction-home.svg';
import React from 'react';
import Loader from '@next-common/ui-components/Loader';
import { IQueueItem } from '@next-common/types';
import SingleTxn from './SingleTxn';

const TransactionHistory = ({ pendingTxns, loading }: { loading: boolean; pendingTxns: IQueueItem[] }) => {
	return (
		<div className='flex flex-col h-full'>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9 max-sm:hidden'>
				<p className='col-span-5 pl-3'>Details</p>
				<p className='col-span-2'>Multisig</p>
				<p className='col-span-2'>Created At</p>
			</div>
			<div className='flex-1 overflow-y-auto max-sm:gap-2'>
				{loading ? (
					<Loader size='large' />
				) : pendingTxns && pendingTxns.length > 0 ? (
					pendingTxns.map((item) => (
						<SingleTxn
							transaction={item}
							network={item.network}
							multisigAddress={item.multisigAddress}
						/>
					))
				) : (
					<div className='flex justify-center items-center h-full w-full'>
						<NoTransactionsHistory />
					</div>
				)}
			</div>
		</div>
	);
};

export default TransactionHistory;
