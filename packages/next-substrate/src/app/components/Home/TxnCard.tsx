// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NoTransactionsHistory from '@next-common/assets/icons/no-transaction-home.svg';
import NoTransactionsQueued from '@next-common/assets/icons/no-transaction-queued-home.svg';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { IQueueItem, ITransaction } from '@next-common/types';
import { ArrowUpRightIcon, ArrowDownLeftIcon, RightArrowOutlined } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import parseDecodedValue from '@next-substrate/utils/parseDecodedValue';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import getMultisigQueueTransactions from '@next-substrate/utils/getMultisigQueueTransactions';
import getMultisigHistoricalTransactions from '@next-substrate/utils/getMultisigHistoricalTransactions';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';

const TxnCard = ({
	newTxn,
	setProxyInProcess
}: {
	newTxn: boolean;
	setProxyInProcess: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
	// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');
	const { activeMultisig, activeNetwork, isSharedMultisig, notOwnerOfMultisig } = useGlobalUserDetailsContext();

	const { activeOrg } = useActiveOrgContext();
	const { apis } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);

	const [historyLoading, setHistoryLoading] = useState<boolean>(false);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);

	const [amountUSD, setAmountUSD] = useState<string>('');

	const multisig = activeOrg?.multisigs?.find(
		(item) =>
			(item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)) &&
			item.network === activeNetwork
	);

	const network = multisig?.network || networks.POLKADOT;

	const addressBook = activeOrg && activeOrg?.addressBook ? activeOrg.addressBook : [];

	const { tokensUsdPrice } = useGlobalCurrencyContext();

	useEffect(() => {
		if (!apis || !apis[network] || !apis[network].apiReady) return;
		if (
			queuedTransactions.some((transaction) => {
				let decodedCallData = null;
				if (transaction.callData) {
					const { data, error } = decodeCallData(transaction.callData, apis[network].api) as { data: any; error: any };
					if (!error && data) {
						decodedCallData = data.extrinsicCall?.toJSON();
					}
				}
				return decodedCallData && decodedCallData?.args?.proxy_type;
			})
		) {
			setProxyInProcess(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apis, network, queuedTransactions]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		const getTransactions = async () => {
			setHistoryLoading(true);
			if (!userAddress) {
				if (activeMultisig && isSharedMultisig && notOwnerOfMultisig) {
					const {
						data: { transactions: multisigTransactions },
						error: multisigError
					} = await getMultisigHistoricalTransactions(activeMultisig, network, 10, 1);

					if (multisigError) {
						setHistoryLoading(false);
						console.log('Error in Fetching Transactions: ', multisigError);
					}

					if (multisigTransactions) {
						setHistoryLoading(false);
						setTransactions(multisigTransactions);
					}
				} else {
					setHistoryLoading(false);
				}
				return;
			}
			try {
				const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getHistoryTransaction_substrate`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: activeMultisig,
						network,
						page: 1
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: multisigTransactions, error: multisigError } = (await createOrgRes.json()) as {
					data: { count: number; transactions: ITransaction[] };
					error: string;
				};

				console.log('HISTORY', multisigTransactions);

				if (multisigError) {
					setHistoryLoading(false);
					console.log('Error in Fetching Transactions: ', multisigError);
				}
				if (multisigTransactions.transactions) {
					setHistoryLoading(false);
					setTransactions(multisigTransactions.transactions);
				}
			} catch (error) {
				console.log(error);
				setHistoryLoading(false);
			}
		};
		getTransactions();
	}, [activeMultisig, network, userAddress, newTxn, currency, isSharedMultisig, notOwnerOfMultisig]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		const getQueue = async () => {
			try {
				setQueueLoading(true);

				if (!userAddress) {
					if (activeMultisig && isSharedMultisig && notOwnerOfMultisig) {
						const { data: queueTransactions, error: queueTransactionsError } = await getMultisigQueueTransactions(
							activeMultisig,
							network,
							10,
							1
						);

						if (queueTransactionsError) {
							setQueueLoading(false);
							return;
						}

						if (queueTransactions) {
							setQueuedTransactions(queueTransactions);
							setQueueLoading(false);
						}
					} else {
						setQueueLoading(false);
					}
				} else {
					const queueTxnsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getQueueTransaction_substrate`, {
						body: JSON.stringify({
							limit: 10,
							multisigAddress: multisig?.address || activeMultisig,
							network,
							page: 1
						}),
						headers: firebaseFunctionsHeader(),
						method: 'POST'
					});
					const { data: queueTransactions, error: queueTransactionsError } = (await queueTxnsRes.json()) as {
						data: IQueueItem[];
						error: string;
					};

					if (queueTransactionsError) {
						setQueueLoading(false);
						return;
					}

					if (queueTransactions) {
						setQueuedTransactions(queueTransactions);
						setQueueLoading(false);
					}
				}
			} catch (error) {
				console.log('ERROR', error);
				setQueueLoading(false);
			}
		};

		getQueue();
	}, [activeMultisig, activeNetwork, isSharedMultisig, multisig, network, newTxn, notOwnerOfMultisig, userAddress]);

	useEffect(() => {
		if (!userAddress || !activeMultisig) return;

		setAmountUSD(parseFloat(tokensUsdPrice[network]?.value?.toString()).toFixed(2));
	}, [activeMultisig, network, tokensUsdPrice, userAddress]);

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
						{!queueLoading && apis && apis[network] && apis[network].apiReady ? (
							queuedTransactions && queuedTransactions.length > 0 ? (
								queuedTransactions
									.filter((_, i) => i < 10)
									// eslint-disable-next-line sonarjs/cognitive-complexity
									.map((transaction, i) => {
										let decodedCallData = null;
										let callDataFunc = null;

										if (transaction.callData) {
											const { data, error } = decodeCallData(transaction.callData, apis[network].api) as {
												data: any;
												error: any;
											};
											if (!error && data) {
												decodedCallData = data.extrinsicCall?.toJSON();
												callDataFunc = data.extrinsicFn;
											}
										}

										const isProxyApproval =
											decodedCallData &&
											(decodedCallData?.args?.proxy_type || decodedCallData?.args?.call?.args?.delegate?.id);

										const customTx =
											decodedCallData?.args &&
											!decodedCallData?.args?.dest &&
											!decodedCallData?.args?.call?.args?.dest &&
											!decodedCallData?.args?.calls?.[0]?.args?.dest &&
											!decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest;

										const destSubstrateAddress =
											decodedCallData &&
											(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
												? getSubstrateAddress(
														decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id
													)
												: '';
										const destAddressName = addressBook?.find(
											(address) => getSubstrateAddress(address.address) === destSubstrateAddress
										)?.name;

										const toText =
											decodedCallData && destSubstrateAddress && destAddressName
												? destAddressName
												: shortenAddress(
														decodedCallData &&
															(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
															? String(
																	getEncodedAddress(
																		decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id,
																		network
																	)
																)
															: ''
													);

										let batchCallRecipients: string[] = [];
										if (decodedCallData && decodedCallData?.args?.calls) {
											batchCallRecipients = decodedCallData?.args?.calls?.map((call: any) => {
												const dest = call?.args?.dest?.id;
												return (
													addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
													shortenAddress(getEncodedAddress(dest, network) || '')
												);
											});
										} else if (decodedCallData && decodedCallData?.args?.call?.args?.calls) {
											batchCallRecipients = decodedCallData?.args?.call?.args?.calls?.map((call: any) => {
												const dest = call?.args?.dest?.id;
												return (
													addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
													shortenAddress(getEncodedAddress(dest, network) || '')
												);
											});
										}
										return (
											<Link
												href={`/transactions?tab=Queue#${transaction.callHash}`}
												key={i}
												className='flex items-center pb-2 mb-2'
											>
												<div className='flex flex-1 items-center'>
													{isProxyApproval ? (
														<div className='bg-[#FF79F2] text-[#FF79F2] bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
															<ArrowUpRightIcon />
														</div>
													) : (
														<div className='bg-waiting text-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
															<ReloadOutlined />
														</div>
													)}
													<div className='ml-3'>
														<h1 className='text-md text-white truncate'>
															{decodedCallData && !isProxyApproval && !customTx ? (
																<span>
																	To:{' '}
																	{batchCallRecipients.length
																		? batchCallRecipients?.map(
																				(a, index) => `${a}${index !== batchCallRecipients.length - 1 ? ', ' : ''}`
																			)
																		: toText}
																</span>
															) : customTx ? (
																<span>
																	Txn: {callDataFunc?.section}.{callDataFunc?.method}
																</span>
															) : (
																<span>Txn: {shortenAddress(transaction.callHash)}</span>
															)}
														</h1>
														<p className='text-text_secondary text-xs'>
															{isProxyApproval ? 'Proxy Creation request in Process...' : 'In Process...'}
														</p>
													</div>
												</div>
												{!isProxyApproval && !customTx && Number(transaction?.totalAmount) ? (
													<div>
														<h1 className='text-md text-white'>
															- {transaction.totalAmount} {chainProperties[network].tokenSymbol}
														</h1>
														{!Number.isNaN(Number(amountUSD)) && (
															<p className='text-text_secondary text-right text-xs'>
																{(Number(amountUSD) * Number(transaction.totalAmount) * Number(currencyPrice)).toFixed(
																	2
																)}{' '}
																{currencyProperties[currency].symbol}
															</p>
														)}
													</div>
												) : (
													<div>
														<h1 className='text-md text-white'>
															-{' '}
															{decodedCallData &&
															(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value)
																? parseDecodedValue({
																		network,
																		value: String(
																			decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value
																		),
																		withUnit: true
																	})
																: `? ${chainProperties[network].tokenSymbol}`}
														</h1>
														{!Number.isNaN(Number(amountUSD)) &&
															(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value) && (
																<p className='text-white text-right text-xs'>
																	{(
																		Number(amountUSD) *
																		Number(currencyPrice) *
																		Number(
																			parseDecodedValue({
																				network,
																				value: String(
																					decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value
																				),
																				withUnit: false
																			})
																		)
																	).toFixed(2)}{' '}
																	{currencyProperties[currency].symbol}
																</p>
															)}
													</div>
												)}
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

						{!historyLoading && apis && apis[network] && apis[network].apiReady ? (
							transactions && transactions.length > 0 ? (
								transactions
									.filter((_, i) => i < 10)
									// eslint-disable-next-line sonarjs/cognitive-complexity
									.map((transaction, i) => {
										const sent = transaction.from === activeMultisig;
										let decodedCallData = null;
										let callDataFunc = null;

										if (transaction.callData) {
											const { data, error } = decodeCallData(transaction.callData, apis[network].api) as {
												data: any;
												error: any;
											};
											if (!error && data) {
												decodedCallData = data.extrinsicCall?.toJSON();
												callDataFunc = data.extrinsicFn;
											}
										}
										const customTx =
											decodedCallData?.args &&
											!decodedCallData?.args?.dest &&
											!decodedCallData?.args?.call?.args?.dest &&
											!decodedCallData?.args?.calls?.[0]?.args?.dest &&
											!decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest;

										const destSubstrateAddress =
											decodedCallData &&
											(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
												? getSubstrateAddress(
														decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id
													)
												: '';
										const destAddressName = addressBook?.find(
											(address) => getSubstrateAddress(address.address) === destSubstrateAddress
										)?.name;
										const toText =
											decodedCallData && destSubstrateAddress && destAddressName
												? destAddressName
												: shortenAddress(
														decodedCallData &&
															(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
															? String(
																	getEncodedAddress(
																		decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id,
																		network
																	)
																)
															: ''
													);

										let batchCallRecipients: string[] = [];
										if (decodedCallData && decodedCallData?.args?.calls) {
											batchCallRecipients = decodedCallData?.args?.calls?.map((call: any) => {
												const dest = call?.args?.dest?.id;
												return (
													addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
													shortenAddress(getEncodedAddress(dest, network) || '')
												);
											});
										} else if (decodedCallData && decodedCallData?.args?.call?.args?.calls) {
											batchCallRecipients = decodedCallData?.args?.call?.args?.calls?.map((call: any) => {
												const dest = call?.args?.dest?.id;
												return (
													addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
													shortenAddress(getEncodedAddress(dest, network) || '')
												);
											});
										}

										return (
											<Link
												href={`/transactions?tab=History#${transaction.callHash}`}
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
													<div className='text-md text-white truncate'>
														{sent ? (
															decodedCallData && !customTx ? (
																<span>
																	To:{' '}
																	{batchCallRecipients?.length
																		? batchCallRecipients?.map(
																				(a, index) => `${a}${index !== batchCallRecipients.length - 1 ? ', ' : ''}`
																			)
																		: toText}
																</span>
															) : customTx ? (
																<span>
																	Txn: {callDataFunc?.section}.{callDataFunc?.method}
																</span>
															) : (
																<span>Txn: {shortenAddress(transaction.callHash)}</span>
															)
														) : (
															<h1 className='text-md text-white'>
																From:{' '}
																{addressBook?.find(
																	(address) => address.address === getEncodedAddress(transaction.from, network)
																)?.name || shortenAddress(getEncodedAddress(transaction.from, network) || '')}
															</h1>
														)}
														<p className='text-text_secondary text-xs'>
															{dayjs(transaction.created_at).format('D-MM-YY [at] HH:mm')}
														</p>
													</div>
												</div>
												<div>
													{sent ? (
														<h1 className='text-md text-failure text-right'>
															-
															{Number(transaction.amount_token) ? (
																<>
																	{transaction.amount_token} {transaction.token || chainProperties[network].tokenSymbol}
																</>
															) : (
																'?'
															)}
														</h1>
													) : (
														<h1 className='text-md text-success text-right'>
															+{transaction.amount_token} {transaction.token}
														</h1>
													)}
													{transaction.amount_token ? (
														<p className='text-text_secondary text-right text-xs'>
															{!Number.isNaN(Number(transaction.amount_usd))
																? (Number(transaction.amount_usd) * Number(currencyPrice)).toFixed(3)
																: Number.isNaN(Number(amountUSD))
																	? '0.00'
																	: (
																			Number(transaction.amount_token) *
																			Number(amountUSD) *
																			Number(currencyPrice)
																		).toFixed(3)}{' '}
															{currencyProperties[currency].symbol}
														</p>
													) : (
														''
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
