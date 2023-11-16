// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NoTransactionsHistory from '@next-common/assets/icons/no-transaction-home.svg';
import NoTransactionsQueued from '@next-common/assets/icons/no-transaction-queued-home.svg';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { ArrowUpRightIcon, RightArrowOutlined, ArrowDownLeftIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import { convertSafeHistoryData, IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';
import { convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import formatBnBalance from '@next-evm/utils/formatBnBalance';
import shortenAddress from '@next-evm/utils/shortenAddress';
import updateDB, { UpdateDB } from '@next-evm/utils/updateDB';
import { chainProperties } from '@next-common/global/evm-network-constants';

const DEFAULT_TXN_CARD_LIMIT = 8;

const TxnCard = () => {
	const { activeMultisig, address, gnosisSafe, addressBook } = useGlobalUserDetailsContext();
	const [queuedTransactions, setQueuedTransactions] = useState<any>([]);
	const [completedTransactions, setCompletedTransactions] = useState<IHistoryTransactions[]>([]);
	const { network } = useGlobalApiContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleTransactions = useCallback(async () => {
		setLoading(true);
		try {
			const completedSafeData = await gnosisSafe.getAllTx(activeMultisig, {
				executed: true,
				limit: DEFAULT_TXN_CARD_LIMIT,
				trusted: true
			});
			const safeData = await gnosisSafe.getPendingTx(activeMultisig);
			const convertedCompletedData = completedSafeData.results.map((safe: any) =>
				convertSafeHistoryData({ ...safe, network })
			);
			const convertedData = safeData.results.map((safe: any) => convertSafePendingData({ ...safe, network }));
			await Promise.all(
				convertedCompletedData.map(async (txn) => {
					const decoded = txn.data && (await gnosisSafe.safeService.decodeData(txn.data));
					if (!txn?.decodedData && decoded) {
						// eslint-disable-next-line no-param-reassign
						txn.decodedData = decoded;
						// eslint-disable-next-line no-param-reassign
						txn.type = decoded.method;
					}
				})
			);
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

					<div className='flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 overflow-auto scale-90 w-[111%] origin-top-left'>
						<h1 className='text-primary text-sm mb-4'>Pending Transactions</h1>
						{loading ? (
							<Loader size='large' />
						) : queuedTransactions ? (
							queuedTransactions.length > 0 ? (
								queuedTransactions
									.filter((_: any, i: number) => i < 10)
									.map((transaction: any, i: any) => {
										const tx = transaction as any;
										return (
											<Link
												href={`/transactions?tab=Queue#${transaction.txHash}`}
												key={i}
												className='flex items-center pb-2 mb-2'
											>
												<div className='flex flex-1 items-center'>
													<div className='bg-[#FF79F2] text-[#FF79F2] bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
														<ArrowUpRightIcon />
													</div>
													<div className='ml-3'>
														<h1 className='text-md text-white'>
															<span>Txn: {shortenAddress(tx.txHash)}</span>
														</h1>
														<p className='text-text_secondary text-xs'>In Process...</p>
													</div>
												</div>

												<div>
													<h1 className='text-md text-white'>
														{formatBnBalance(
															tx.amount_token,
															{
																numberAfterComma: 3,
																withThousandDelimitor: false
															},
															network
														)}{' '}
														{chainProperties[network].tokenSymbol}
													</h1>
												</div>

												<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
													<ArrowRightOutlined />
												</div>
											</Link>
										);
									})
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
					<div className='flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 scale-90 w-[111%] origin-top-left overflow-auto'>
						<h1 className='text-primary text-sm mb-4'>Completed Transactions</h1>

						{loading ? (
							<Loader size='large' />
						) : completedTransactions ? (
							completedTransactions.length > 0 ? (
								completedTransactions
									.filter((_: any, i: number) => i < 10)
									// eslint-disable-next-line sonarjs/cognitive-complexity
									.map((transaction, i) => {
										// const from = transaction?.receipt?.options?.from;
										const sent =
											transaction.type === 'sent' ||
											transaction.type === 'MULTISIG_TRANSACTION' ||
											transaction.type === 'removeOwner' ||
											transaction.type === 'multiSend';

										let toText = '';
										if (transaction.to) {
											toText =
												addressBook.find((a) => a.address === transaction.to)?.name ||
												shortenAddress(transaction.to || '');
										}
										let batchCallRecipients: string[] = [];
										let totalAmount: string = '';
										if (transaction.type === 'multiSend') {
											batchCallRecipients = transaction?.decodedData?.parameters?.[0]?.valueDecoded?.map(
												(item: any) => {
													const dest = item.to;
													return addressBook.find((a) => a.address === dest)?.name || shortenAddress(dest || '');
												}
											);
											totalAmount = transaction?.decodedData?.parameters?.[0]?.valueDecoded?.reduce(
												(total: string, item: any) => {
													return Number(total) + Number(item.value);
												},
												''
											);
										}
										return (
											<Link
												href={`/transactions?tab=History#${transaction?.txHash || ''}`}
												key={i}
												className='flex items-center pb-2 mb-2'
											>
												<div className='flex flex-1 items-center'>
													<div
														className={`${
															sent ? 'bg-failure text-failure' : 'bg-success text-success'
														} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}
													>
														{sent ? <ArrowUpRightIcon /> : <ArrowDownLeftIcon />}
													</div>
													<div>
														<h1 className='text-md text-white'>
															<span>
																{transaction.type === 'addOwnerWithThreshold' ? (
																	'Added Owner'
																) : transaction.type === 'removeOwner' ? (
																	'Removed Owner'
																) : transaction.type === 'multiSend' ? (
																	<>
																		To:{' '}
																		{batchCallRecipients?.length &&
																			batchCallRecipients.map(
																				(a, index) => `${a}${index !== batchCallRecipients.length - 1 ? ', ' : ''}`
																			)}
																	</>
																) : transaction.to ? (
																	<>To: {toText}</>
																) : (
																	`Txn: ${shortenAddress(transaction?.txHash)}`
																)}
															</span>
														</h1>

														{/* <p className='text-text_secondary text-xs'>{dayjs(transaction.created_at).format('D-MM-YY [at] HH:mm')}</p> */}
													</div>
												</div>
												<div>
													{transaction.type === 'addOwnerWithThreshold' || transaction.type === 'removeOwner' ? (
														<span className='text-md text-white'>-?</span>
													) : sent ? (
														<h1 className='text-md text-failure'>
															-
															{ethers?.utils
																?.formatEther(totalAmount.toString() || transaction.amount_token?.toString())
																?.toString()}{' '}
															{chainProperties[network].tokenSymbol}
														</h1>
													) : (
														<h1 className='text-md text-success'>
															+{ethers?.utils?.formatEther(transaction.amount_token?.toString())?.toString()}{' '}
															{chainProperties[network].tokenSymbol}
														</h1>
													)}
												</div>
												<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
													<ArrowRightOutlined />
												</div>
											</Link>
										);
									})
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
