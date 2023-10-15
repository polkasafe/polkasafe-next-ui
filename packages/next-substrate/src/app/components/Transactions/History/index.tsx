// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useEffect, useState, FC } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { chainProperties } from '@next-common/global/networkConstants';
import usePagination from '@next-substrate/hooks/usePagination';
import { ITransaction } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import Pagination from '@next-common/ui-components/Pagination';
import fetchTokenToUSDPrice from '@next-substrate/utils/fetchTokentoUSDPrice';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import ExportTransactionsHistory, { EExportType } from './ExportTransactionsHistory';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

interface IHistory {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: boolean;
	openExportModal: boolean;
	setOpenExportModal: React.Dispatch<React.SetStateAction<boolean>>;
	setHistoryTxnLength: React.Dispatch<React.SetStateAction<number>>;
	exportType: EExportType;
}

const History: FC<IHistory> = ({
	loading,
	exportType,
	setLoading,
	refetch,
	openExportModal,
	setOpenExportModal,
	setHistoryTxnLength
}) => {
	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { currencyPrice } = useGlobalCurrencyContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const { network } = useGlobalApiContext();
	const pathname = usePathname();
	const { currentPage, setPage, totalDocs, setTotalDocs } = usePagination();
	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [amountUSD, setAmountUSD] = useState<string>('');

	useEffect(() => {
		if (!userAddress || !signature || !activeMultisig) return;

		fetchTokenToUSDPrice(1, network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [activeMultisig, network, signature, userAddress]);

	useEffect(() => {
		const hash = pathname.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [pathname, transactions]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		const getTransactions = async () => {
			if (!userAddress || !signature || !multisig || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			setLoading(true);
			try {
				let data: any = [];
				let docs: number = 0;

				const getMultisigHistoryTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigHistory`, {
					body: JSON.stringify({
						limit: multisig.proxy ? 5 : 10,
						multisigAddress: multisig?.address,
						page: currentPage
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});
				const {
					data: { transactions: multisigTransactions, count: multisigTransactionsCount },
					error: multisigError
				} = (await getMultisigHistoryTransactions.json()) as {
					data: { transactions: ITransaction[]; count: number };
					error: string;
				};
				if (multisig.proxy) {
					const getProxyHistoryTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigHistory`, {
						body: JSON.stringify({
							limit: 10 - multisigTransactions.length,
							multisigAddress: multisig.proxy,
							page: currentPage
						}),
						headers: firebaseFunctionsHeader(network),
						method: 'POST'
					});
					const {
						data: { transactions: proxyTransactions, count: proxyTransactionsCount },
						error: proxyError
					} = (await getProxyHistoryTransactions.json()) as {
						data: { transactions: ITransaction[]; count: number };
						error: string;
					};
					if (proxyTransactions && !proxyError) {
						setLoading(false);
						data = proxyTransactions;
						docs = proxyTransactionsCount;
					}
				}

				if (multisigTransactions && !multisigError) {
					setLoading(false);
					data = [...data, ...multisigTransactions];
					setTransactions(data);
					docs += multisigTransactionsCount;
					setTotalDocs(docs);
				}
			} catch (error) {
				setLoading(false);
				console.log(error);
			}
		};
		getTransactions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, multisig, network, signature, userAddress, refetch, currentPage]);

	useEffect(() => {
		if (transactions && transactions?.length > 0) {
			setHistoryTxnLength(transactions?.length);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactions]);

	if (loading) return <Loader size='large' />;

	return (
		<>
			<ModalComponent
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
					historyTxns={transactions?.map((txn) => {
						const type: 'Sent' | 'Received' =
							multisig?.address === txn.from || multisig?.proxy === txn.from ? 'Sent' : 'Received';
						const amount = !Number.isNaN(txn.amount_usd)
							? (Number(txn.amount_usd) * Number(currencyPrice)).toFixed(4)
							: Number.isNaN(Number(amountUSD))
							? '0'
							: (Number(txn.amount_token) * Number(amountUSD) * Number(currencyPrice)).toFixed(4);
						return {
							amount: type === 'Sent' ? `-${amount}` : amount,
							callhash: txn.callHash,
							date: txn.created_at,
							from: txn.from,
							network,
							token: chainProperties[network].tokenSymbol
						};
					})}
					closeModal={() => setOpenExportModal(false)}
				/>
			</ModalComponent>
			{transactions && transactions.length > 0 ? (
				<div className='flex flex-col gap-y-[10px] mb-2 h-[790px] overflow-auto pr-1'>
					{transactions
						.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))
						.map((transaction, index) => {
							return (
								<section
									id={transaction.callHash}
									key={index}
								>
									{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
									{created_at}
								</h4> */}
									{
										// eslint-disable-next-line react/jsx-props-no-spreading
										<Transaction {...transaction} />
									}
								</section>
							);
						})}
				</div>
			) : (
				<NoTransactionsHistory />
			)}
			{totalDocs && totalDocs > 10 && (
				<div className='flex justify-center'>
					<Pagination
						className='self-end'
						currentPage={currentPage}
						defaultPageSize={2}
						setPage={setPage}
						totalDocs={totalDocs || 1}
					/>
				</div>
			)}
		</>
	);
};

export default History;
