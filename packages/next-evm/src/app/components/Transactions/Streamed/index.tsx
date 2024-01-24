import Loader from '@next-common/ui-components/Loader';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSuperfluidContext } from '@next-evm/context/SuperfluidContext';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import Transaction, { IStreamedData } from './Transaction';
import NoTransactionsQueued from '../Queued/NoTransactionsQueued';

const Streamed = ({
	refetch,
	loading,
	setLoading
}: {
	refetch: boolean;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { superfluidFramework } = useSuperfluidContext();
	const { activeOrg } = useActiveOrgContext();

	const [streamsData, setStreamsData] = useState<IStreamedData[]>([]);

	const getStreamedPaymentsForOrg = useCallback(async () => {
		if (!activeOrg || !activeOrg.multisigs || activeMultisig) return;
		let txns = [];
		setLoading(true);
		await Promise.all(
			activeOrg.multisigs.map(async (multi) => {
				const res = await superfluidFramework.query.listStreams({
					sender: multi.address
				});
				if (res && res.data && res.data.length > 0) {
					const filteredStreams: IStreamedData[] = res.data.map((item) => {
						return {
							cancelled: item.currentFlowRate === '0',
							endDate: item.currentFlowRate === '0' && dayjs.unix(item.updatedAtTimestamp).toDate(),
							flowRate: BigInt(item.currentFlowRate),
							incoming: item.receiver === multi.address,
							multisigAddress: multi.address,
							receiver: item.receiver,
							sender: item.sender,
							startDate: dayjs.unix(item.createdAtTimestamp).toDate(),
							tokenSymbol: item.token.symbol,
							txHash: item.flowUpdatedEvents[0].transactionHash
						};
					});
					txns = [...txns, ...filteredStreams];
				}
			})
		);
		setLoading(false);
		setStreamsData(txns);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, activeOrg, superfluidFramework]);

	useEffect(() => {
		getStreamedPaymentsForOrg();
	}, [getStreamedPaymentsForOrg, refetch]);

	const getStreamedPayments = useCallback(async () => {
		if (!activeMultisig) return;
		setLoading(true);
		try {
			const txns = await superfluidFramework.query.listStreams({
				sender: activeMultisig
			});
			setLoading(false);

			if (txns && txns.data && txns.data.length > 0) {
				const filteredStreams: IStreamedData[] = txns.data.map((item) => {
					return {
						cancelled: item.currentFlowRate === '0',
						endDate: item.currentFlowRate === '0' && dayjs.unix(item.updatedAtTimestamp).toDate(),
						flowRate: BigInt(item.currentFlowRate),
						incoming: item.receiver === activeMultisig,
						multisigAddress: activeMultisig,
						receiver: item.receiver,
						sender: item.sender,
						startDate: dayjs.unix(item.createdAtTimestamp).toDate(),
						tokenSymbol: item.token.symbol,
						txHash: item.flowUpdatedEvents[0].transactionHash
					};
				});
				setStreamsData(filteredStreams);
			}
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, superfluidFramework]);

	useEffect(() => {
		getStreamedPayments();
	}, [getStreamedPayments, refetch]);

	if (loading) {
		return (
			<div className='h-full'>
				<Loader size='large' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-[10px]'>
			<div className='bg-bg-secondary mb-2 rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9'>
				<p className='col-span-3 pl-3'>To / From</p>
				<p className='col-span-2'>Flow Rate</p>
				<p className='col-span-3'>Start / End Date</p>
				<p className='col-span-1'>Actions</p>
			</div>
			{streamsData && streamsData.length > 0 ? (
				streamsData.map((item) => (
					<Transaction
						multisigAddress={item.multisigAddress}
						sender={item.sender}
						receiver={item.receiver}
						cancelled={item.cancelled}
						flowRate={item.flowRate}
						startDate={item.startDate}
						endDate={item.endDate}
						txHash={item.txHash}
						incoming={item.incoming}
						tokenSymbol={item.tokenSymbol.slice(0, -1)}
					/>
				))
			) : (
				<NoTransactionsQueued />
			)}
		</div>
	);
};

export default Streamed;
