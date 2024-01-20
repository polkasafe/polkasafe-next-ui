import { NETWORK } from '@next-common/global/evm-network-constants';
import returnTxUrl from '@next-common/global/gnosisService';
import NoTransactionsHistory from '@next-evm/app/components/Transactions/History/NoTransactionsHistory';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';
import { useWallets } from '@privy-io/react-auth';
import { EthersAdapter } from '@safe-global/protocol-kit';
// import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { convertSafePendingData } from '@next-evm/utils/convertSafeData/convertSafePending';
import Loader from '@next-common/ui-components/Loader';
import SingleTxn from './SingleTxn';

const TransactionHistory = () => {
	const { activeOrg } = useActiveOrgContext();
	const { wallets } = useWallets();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [completedTransactions, setCompletedTransactions] = useState<IHistoryTransactions[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const fetchAllTransactions = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0) return;
		// eslint-disable-next-line sonarjs/no-unused-collection
		const allTxns = [];
		setLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multisig) => {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				const provider = await wallets?.[0].getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				const completedSafeData = await gnosisService.getPendingTx(multisig.address);
				const convertedCompletedData = completedSafeData.results.map((safe: any) =>
					convertSafePendingData({ ...safe, network: multisig.network })
				);
				allTxns.push(...convertedCompletedData);
			})
		);
		setLoading(false);
		const sorted = [...allTxns].sort((a, b) => {
			const date1 = new Date(a?.created_at);
			const date2 = new Date(b?.created_at);
			return Number(date1) - Number(date2);
		});
		setCompletedTransactions(sorted.reverse());
		console.log('all txns', sorted.reverse());
	}, [activeOrg, wallets]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions]);

	return (
		<div>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 h-[111%] w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9'>
				<p className='col-span-5 pl-3'>Details</p>
				<p className='col-span-2'>Multisig</p>
				<p className='col-span-2'>Network</p>
			</div>
			{loading ? (
				<Loader size='large' />
			) : completedTransactions && completedTransactions.length > 0 ? (
				completedTransactions.map((item) => (
					<SingleTxn
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
