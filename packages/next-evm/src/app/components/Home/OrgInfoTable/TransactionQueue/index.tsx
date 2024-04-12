import { NETWORK } from '@next-common/global/evm-network-constants';
import NoTransactionsHistory from '@next-evm/app/components/Transactions/History/NoTransactionsHistory';
import React from 'react';
import { IQueuedTransactions } from '@next-evm/utils/convertSafeData/convertSafePending';
import Loader from '@next-common/ui-components/Loader';
import SingleTxn from './SingleTxn';

const TransactionHistory = ({ pendingTxns, loading }: { loading: boolean; pendingTxns: IQueuedTransactions[] }) => {
	return (
		<div>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 h-[111%] w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9'>
				<p className='col-span-5 pl-3'>Details</p>
				<p className='col-span-2'>Multisig</p>
				<p className='col-span-2'>Created At</p>
			</div>
			{loading ? (
				<Loader size='large' />
			) : pendingTxns && pendingTxns.length > 0 ? (
				pendingTxns.map((item) => (
					<SingleTxn
						createdAt={item.created_at}
						callHash={item.txHash}
						callData={item.data}
						txType={item.type}
						recipientAddress={item.to}
						value={item.amount_token}
						network={item.network as NETWORK}
						multisigAddress={item.safeAddress}
					/>
				))
			) : (
				<NoTransactionsHistory />
			)}
		</div>
	);
};

export default TransactionHistory;
