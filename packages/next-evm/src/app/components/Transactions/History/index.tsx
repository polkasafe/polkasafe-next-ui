// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useEffect, useState, FC, useCallback } from 'react';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { usePagination } from '@next-evm/hooks/usePagination';
import Loader from '@next-common/ui-components/Loader';
import Pagination from '@next-common/ui-components/Pagination';
import { convertSafeHistoryData } from '@next-evm/utils/convertSafeData/convertSafeHistory';
import updateDB, { UpdateDB } from '@next-evm/utils/updateDB';
import returnTxUrl from '@next-common/global/gnosisService';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Transaction from './Transaction';
import NoTransactionsHistory from './NoTransactionsHistory';

interface IHistory {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: boolean;
}

const History: FC<IHistory> = ({ loading, setLoading, refetch }) => {
	const { currentPage, setPage, totalDocs } = usePagination();
	const [transactions, setTransactions] = useState<any[]>([]);
	const { activeMultisig, activeMultisigData } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { network } = useGlobalApiContext();
	const { address } = useGlobalUserDetailsContext();

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	useEffect(() => {
		const hash = typeof window !== 'undefined' && window.location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, []);

	const fetchAllTransactions = useCallback(async () => {
		if (activeMultisig || !activeOrg?.multisigs || activeOrg.multisigs?.length === 0) return;

		const allTxns = [];
		setLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				const provider = await connectedWallet?.getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const completedSafeData = await gnosisService.getAllTx(multisig.address, {
					executed: true,
					trusted: true
				});
				const convertedCompletedData = completedSafeData.results.map((safe: any) =>
					convertSafeHistoryData({ ...safe, network: multisig.network }, multisig?.address)
				);
				allTxns.push(...convertedCompletedData);
			})
		);
		setLoading(false);
		setTransactions(allTxns);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, activeOrg?.multisigs, connectedWallet]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions, refetch]);

	useEffect(() => {
		if (!activeMultisig || !activeMultisigData) {
			return;
		}
		(async () => {
			setLoading(true);
			try {
				const txUrl = returnTxUrl(activeMultisigData.network as NETWORK);
				const provider = await connectedWallet?.getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const safeData = await gnosisService.getAllTx(activeMultisig, {
					executed: true,
					trusted: true
				});
				const convertedData = safeData.results.map((safe: any) =>
					convertSafeHistoryData({ ...safe, network }, activeMultisig)
				);
				setTransactions(convertedData);
				updateDB(UpdateDB.Update_History_Transaction, { transactions: convertedData }, address, network);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, address, network, refetch]);

	if (loading) {
		return (
			<div className='h-full'>
				<Loader size='large' />
			</div>
		);
	}
	return (
		<>
			{transactions && transactions.length > 0 ? (
				<div className='flex flex-col mb-2'>
					{transactions
						.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1))
						.map((transaction, index) => {
							return (
								<section
									id={transaction.callHash}
									key={index}
								>
									<Transaction
										approvals={transaction.signatures ? transaction.signatures.map((item: any) => item.address) : []}
										// eslint-disable-next-line react/jsx-props-no-spreading
										{...transaction}
									/>
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
