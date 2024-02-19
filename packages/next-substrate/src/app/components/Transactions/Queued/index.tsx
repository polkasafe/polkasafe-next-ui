// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IQueueItem } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';

import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import getMultisigQueueTransactions from '@next-substrate/utils/getMultisigQueueTransactions';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
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
	const { activeMultisig, isSharedMultisig, notOwnerOfMultisig } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);
	const pathname = usePathname();

	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === activeMultisig || item.proxy === activeMultisig
	);

	useEffect(() => {
		const hash = pathname.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [queuedTransactions, pathname]);

	const fetchAllTransactions = useCallback(async () => {
		if (activeMultisig || !activeOrg || !activeOrg.multisigs || activeOrg.multisigs?.length === 0) return;
		const allTxns = [];
		setLoading(true);
		await Promise.all(
			// eslint-disable-next-line @typescript-eslint/no-shadow
			activeOrg.multisigs.map(async (multisig) => {
				const queueTxnsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getQueueTransaction_substrate`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: multisig?.address,
						network: multisig.network,
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
					setLoading(false);
					return;
				}

				if (queueTransactions) {
					queueTransactions.forEach((item) =>
						allTxns.push({ ...item, multisigAddress: multisig.address, network: multisig.network })
					);
					setLoading(false);
				}
			})
		);
		setLoading(false);
		const sorted = [...allTxns].sort((a, b) => {
			const date1 = new Date(a?.created_at);
			const date2 = new Date(b?.created_at);
			return Number(date1) - Number(date2);
		});
		setQueuedTransactions(sorted.reverse());
		console.log('all txns', sorted.reverse());
	}, [activeMultisig, activeOrg, setLoading]);

	useEffect(() => {
		fetchAllTransactions();
	}, [fetchAllTransactions]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const fetchQueuedTransactions = useCallback(async () => {
		if (!activeMultisig) return;
		try {
			setLoading(true);
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			// const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress) {
				if (activeMultisig && isSharedMultisig && notOwnerOfMultisig) {
					const { data: queueTransactions, error: queueTransactionsError } = await getMultisigQueueTransactions(
						activeMultisig,
						multisig.network,
						10,
						1
					);

					if (queueTransactionsError) {
						setLoading(false);
						return;
					}

					if (queueTransactions) {
						setQueuedTransactions(queueTransactions);
						setLoading(false);
					}
				} else {
					setLoading(false);
				}
			} else {
				const queueTxnsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getQueueTransaction_substrate`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: multisig?.address || activeMultisig,
						network: multisig.network,
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
	}, [activeMultisig]);

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
							multisigAddress={transaction.multisigAddress}
							network={transaction.network}
							totalAmount={transaction.totalAmount}
							setQueuedTransactions={setQueuedTransactions}
							date={dayjs(transaction.created_at).format('llll')}
							status={transaction.status}
							approvals={transaction.approvals}
							threshold={transaction?.threshold || multisig?.threshold || 0}
							callData={transaction.callData}
							callHash={transaction.callHash}
							note={transaction.note || ''}
							refetch={() => setRefetch((prev) => !prev)}
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
