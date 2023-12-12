// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IQueueItem } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import fetchTokenToUSDPrice from '@next-substrate/utils/fetchTokentoUSDPrice';

import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

dayjs.extend(LocalizedFormat);

interface IQueued {
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refetch: boolean;
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

const Queued: FC<IQueued> = ({ loading, setLoading, refetch, setRefetch }) => {
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);
	const pathname = usePathname();
	const [amountUSD, setAmountUSD] = useState<string>('');
	const multisig = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		fetchTokenToUSDPrice(1, network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [network]);

	useEffect(() => {
		const hash = pathname.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [queuedTransactions, pathname]);

	const fetchQueuedTransactions = useCallback(async () => {
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature || !activeMultisig) {
				console.log('ERROR');
				setLoading(false);
			} else {
				const { data: queueTransactions, error: queueTransactionsError } = await nextApiClientFetch<IQueueItem[]>(
					`${SUBSTRATE_API_URL}/getMultisigQueue`,
					{
						limit: 10,
						multisigAddress: activeMultisig,
						network,
						page: 1
					}
				);
				if (queueTransactionsError) {
					setLoading(false);
					return;
				}

				if (queueTransactions) {
					setQueuedTransactions(queueTransactions);
					setLoading(false);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, network]);

	useEffect(() => {
		fetchQueuedTransactions();
	}, [fetchQueuedTransactions, refetch]);

	if (loading) return <Loader size='large' />;

	return queuedTransactions && queuedTransactions.length > 0 ? (
		<div className='flex flex-col gap-y-[10px]'>
			{queuedTransactions.map((transaction, index) => {
				return (
					<section
						id={transaction.callHash}
						key={index}
					>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction
							totalAmount={transaction.totalAmount}
							setQueuedTransactions={setQueuedTransactions}
							date={dayjs(transaction.created_at).format('llll')}
							status={transaction.status}
							approvals={transaction.approvals}
							threshold={multisig?.threshold || 0}
							callData={transaction.callData}
							callHash={transaction.callHash}
							note={transaction.note || ''}
							refetch={() => setRefetch((prev) => !prev)}
							amountUSD={amountUSD}
							numberOfTransactions={queuedTransactions.length || 0}
							notifications={transaction?.notifications}
							transactionFields={transaction?.transactionFields}
						/>
					</section>
				);
			})}
		</div>
	) : (
		<NoTransactionsQueued />
	);
};

export default Queued;
