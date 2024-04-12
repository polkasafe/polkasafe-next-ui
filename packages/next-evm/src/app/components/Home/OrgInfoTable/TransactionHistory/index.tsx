import { NETWORK } from '@next-common/global/evm-network-constants';
import NoTransactionsHistory from '@next-evm/app/components/Transactions/History/NoTransactionsHistory';
import { IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';
import React from 'react';
import Loader from '@next-common/ui-components/Loader';
import SingleTxn from './SingleTxn';

const TransactionHistory = ({
	completedTransactions,
	loading
}: {
	completedTransactions: IHistoryTransactions[];
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
						executedAt={item.created_at}
						callData={item.data}
						callHash={item.txHash}
						multisigAddress={item.safeAddress || item.to}
						network={item.network as NETWORK}
						receivedTransfers={item.receivedTransfers}
						type={item.type}
						amount_token={item.amount_token}
						to={item.to}
					/>
				))
			) : (
				<NoTransactionsHistory />
			)}
		</div>
	);
};

export default TransactionHistory;
