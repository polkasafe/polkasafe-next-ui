import NoTransactionsHistory from '@next-common/assets/icons/no-transaction-home.svg';
import React from 'react';
import Loader from '@next-common/ui-components/Loader';
import { ITransaction } from '@next-common/types';
import SingleTxn from './SingleTxn';

const TransactionHistory = ({
	completedTransactions,
	loading
}: {
	completedTransactions: ITransaction[];
	loading: boolean;
}) => {
	return (
		<div>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 h-[111%] w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9'>
				<p className='col-span-5 pl-3'>Details</p>
				<p className='col-span-2'>Multisig</p>
				<p className='col-span-2'>Executed At</p>
			</div>
			{loading ? (
				<Loader size='large' />
			) : completedTransactions && completedTransactions.length > 0 ? (
				completedTransactions.map((item) => (
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
	);
};

export default TransactionHistory;
