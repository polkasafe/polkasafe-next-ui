// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NoTransactionsHistory from '@next-common/assets/icons/no-transaction-home.svg';
import NoTransactionsQueued from '@next-common/assets/icons/no-transaction-queued-home.svg';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { RightArrowOutlined } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import { convertSafeHistoryData, IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';
import { IQueuedTransactions, convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import updateDB, { UpdateDB } from '@next-evm/utils/updateDB';
import dayjs from 'dayjs';
import QueueTransaction from './QueueTransaction';
import HistoryTransaction from './HistoryTransaction';

const TxnCard = () => {
	const { activeMultisig, address, gnosisSafe } = useGlobalUserDetailsContext();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueuedTransactions[]>([]);
	const [completedTransactions, setCompletedTransactions] = useState<IHistoryTransactions[]>([]);
	const { network } = useGlobalApiContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleTransactions = useCallback(async () => {
		setLoading(true);
		try {
			const completedSafeData = await gnosisSafe.getAllTx(activeMultisig, {
				executed: true,
				trusted: true
			});
			const safeData = await gnosisSafe.getPendingTx(activeMultisig);
			const convertedCompletedData = completedSafeData.results.map((safe: any) =>
				convertSafeHistoryData({ ...safe, network })
			);
			const convertedData = safeData.results.map((safe: any) => convertSafePendingData({ ...safe, network }));
			// await Promise.all(
			// convertedCompletedData.map(async (txn) => {
			// const decoded = txn.data && (await gnosisSafe.safeService.decodeData(txn.data));
			// if (!txn?.decodedData && decoded) {
			// // eslint-disable-next-line no-param-reassign
			// txn.decodedData = decoded;
			// // eslint-disable-next-line no-param-reassign
			// txn.type = decoded.method;
			// }
			// })
			// );
			setQueuedTransactions(convertedData);
			setCompletedTransactions(convertedCompletedData);
			setLoading(false);
			updateDB(
				UpdateDB.Update_Pending_Transaction,
				{ transactions: [...convertedData, ...convertedCompletedData] },
				address,
				network
			);
		} catch (e) {
			console.log(e);
			setLoading(false);
		}
	}, [activeMultisig, address, network, gnosisSafe]);

	useEffect(() => {
		if (!activeMultisig || !gnosisSafe) {
			return;
		}
		handleTransactions();
	}, [activeMultisig, handleTransactions, gnosisSafe]);

	return (
		<div>
			<div className='grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1'>
				{/* Txn Queue */}
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className='flex justify-between flex-row w-full mb-2'>
						<h2 className='text-base font-bold text-white'>Transaction Queue</h2>
						<Link
							href='/transactions?tab=Queue'
							className='flex items-center justify-center text-primary cursor-pointer'
						>
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined />
						</Link>
					</div>

					<div className='flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 scale-90 w-[111%] origin-top-left'>
						<h1 className='text-primary text-sm mb-4'>Pending Transactions</h1>
						{loading ? (
							<Loader size='large' />
						) : queuedTransactions ? (
							queuedTransactions.length > 0 ? (
								<div className='flex flex-col flex-1 overflow-y-auto'>
									{queuedTransactions
										.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))
										.filter((_: any, i: number) => i < 10)
										.map((transaction: any) => {
											return (
												<QueueTransaction
													key={transaction.txHash}
													callHash={transaction.txHash}
													callData={transaction.data}
													txType={transaction.type}
													recipientAddress={transaction.to}
												/>
											);
										})}
								</div>
							) : (
								<div className='flex flex-col gap-y-5 items-center justify-center'>
									<NoTransactionsQueued />
									<p className='font-normal text-sm leading-[15px] text-text_secondary'>No past transactions</p>
								</div>
							)
						) : (
							<Loader />
						)}
					</div>
				</div>

				{/* Txn History */}
				<div className='md:col-start-7 col-start-1 col-end-13'>
					<div className='flex justify-between flex-row w-full mb-2'>
						<h2 className='text-base font-bold text-white'>Transaction History</h2>
						<Link
							href='/transactions?tab=History'
							className='flex items-center justify-center text-primary cursor-pointer'
						>
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined />
						</Link>
					</div>
					<div className='flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 scale-90 w-[111%] origin-top-left'>
						<h1 className='text-primary text-sm mb-4'>Completed Transactions</h1>

						{loading ? (
							<Loader size='large' />
						) : completedTransactions ? (
							completedTransactions.length > 0 ? (
								<div className='flex flex-col flex-1 overflow-y-auto'>
									{completedTransactions
										.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))
										// eslint-disable-next-line sonarjs/cognitive-complexity
										.map((transaction) => {
											return (
												<HistoryTransaction
													key={transaction.txHash}
													callData={transaction.data}
													callHash={transaction.txHash}
													receivedTransfers={transaction.receivedTransfers}
													type={transaction.type}
													amount_token={transaction.amount_token}
													to={transaction.to}
												/>
											);
										})}
								</div>
							) : (
								<div className='flex flex-col gap-y-5 items-center justify-center'>
									<NoTransactionsHistory />
									<p className='font-normal text-sm leading-[15px] text-text_secondary'>No past transactions</p>
								</div>
							)
						) : (
							<Loader />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TxnCard;
