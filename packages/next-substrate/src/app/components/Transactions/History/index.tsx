// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useEffect, useState, FC } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import usePagination from '@next-substrate/hooks/usePagination';
import { ITransaction } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import Pagination from '@next-common/ui-components/Pagination';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import getMultisigHistoricalTransactions from '@next-substrate/utils/getMultisigHistoricalTransactions';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import useFetch from '@next-substrate/hooks/useFetch';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
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
	const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
	// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');
	const { activeMultisig, isSharedMultisig, notOwnerOfMultisig } = useGlobalUserDetailsContext();
	const { currencyPrice, tokensUsdPrice } = useGlobalCurrencyContext();
	const { activeOrg } = useActiveOrgContext();
	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === activeMultisig || checkMultisigWithProxy(item.proxy, activeMultisig)
	);

	const multisigs = activeOrg?.multisigs?.map((item) => ({ address: item.address, network: item.network }));

	const network = multisig?.network || networks.POLKADOT;

	const pathname = usePathname();
	const { currentPage, setPage, totalDocs, setTotalDocs } = usePagination();
	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [amountUSD, setAmountUSD] = useState<string>('');

	const {
		data: historyData,
		// error,
		loading: historyLoading,
		refetch: historyRefetch
	} = useFetch<{ count: number; transactions: ITransaction[] }>({
		body: {
			limit: 10,
			multisigs: multisigs && multisigs.length > 0 ? multisigs : null,
			page: 1
		},
		cache: {
			enabled: true,
			tte: 3600
		},
		headers: firebaseFunctionsHeader(),
		initialEnabled: false,
		key: `all-history-txns-${activeOrg?.id}`,
		url: `${FIREBASE_FUNCTIONS_URL}/getHistoryTransactionForOrg_substrate`
	});

	useEffect(
		() => {
			if (activeMultisig || !activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0) return;
			historyRefetch();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[activeOrg, activeOrg?.id]
	);

	useEffect(() => {
		if (!historyData || !historyData.transactions) return;

		const sorted = historyData.transactions.sort((a, b) =>
			dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1
		);
		setTransactions(sorted);
	}, [historyData]);

	useEffect(() => {
		if (!userAddress || !activeMultisig) return;

		setAmountUSD(parseFloat(tokensUsdPrice[network]?.value?.toString())?.toFixed(2));
	}, [activeMultisig, network, tokensUsdPrice, userAddress]);

	useEffect(() => {
		const hash = pathname.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [pathname, transactions]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (!activeMultisig) return;
		const getTransactions = async () => {
			setLoading(true);
			if (!userAddress || !multisig) {
				if (activeMultisig && isSharedMultisig && notOwnerOfMultisig) {
					const {
						data: { transactions: multisigTransactions },
						error: multisigError
					} = await getMultisigHistoricalTransactions(activeMultisig, network, 10, 1);

					if (multisigError) {
						setLoading(false);
						console.log('Error in Fetching Transactions: ', multisigError);
					}

					if (multisigTransactions) {
						setLoading(false);
						setTransactions(
							multisigTransactions.map((item) => ({
								...item,
								multisigAddress: activeMultisig,
								network: multisig.network
							}))
						);
					}
				} else {
					setLoading(false);
				}
				return;
			}
			try {
				let data: any = [];
				let docs: number = 0;

				const multisigHistoryRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getHistoryTransaction_substrate`, {
					body: JSON.stringify({
						limit: multisig.proxy ? 5 : 10,
						multisigAddress: isSharedMultisig ? activeMultisig : multisig?.address,
						network,
						page: currentPage
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});
				const { data: multisigTransactions, error: multisigError } = (await multisigHistoryRes.json()) as {
					data: { count: number; transactions: ITransaction[] };
					error: string;
				};

				if (multisig.proxy) {
					const proxyHistoryRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getHistoryTransaction_substrate`, {
						body: JSON.stringify({
							limit: 10 - multisigTransactions.transactions.length,
							multisigAddress: multisig.proxy,
							network,
							page: currentPage
						}),
						headers: firebaseFunctionsHeader(),
						method: 'POST'
					});
					const { data: proxyTransactions, error: proxyError } = (await proxyHistoryRes.json()) as {
						data: { count: number; transactions: ITransaction[] };
						error: string;
					};

					if (proxyTransactions && !proxyError) {
						setLoading(false);
						data = proxyTransactions.transactions;
						docs = proxyTransactions.count;
					}
				}

				if (multisigTransactions && !multisigError) {
					setLoading(false);
					data = [...data, ...multisigTransactions.transactions];
					setTransactions(
						data.map((item) => ({
							...item,
							multisigAddress: activeMultisig,
							network: multisig.network
						}))
					);
					docs += multisigTransactions.count;
					setTotalDocs(docs);
				}
			} catch (error) {
				setLoading(false);
				console.log(error);
			}
		};
		getTransactions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, multisig, network, userAddress, refetch, currentPage]);

	useEffect(() => {
		if (transactions && transactions?.length > 0) {
			setHistoryTxnLength(transactions?.length);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactions]);

	if (loading || historyLoading) return <Loader size='large' />;

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
