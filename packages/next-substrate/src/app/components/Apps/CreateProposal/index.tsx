/* eslint-disable react/jsx-props-no-spreading */
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@next-common/ui-components/Loader';
import { Dropdown, Radio } from 'antd';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { BN_ZERO } from '@polkadot/util';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { EKillOrCancel, EReferenda } from './types';
import useMultisig from '../hooks/useMultisig';
import TransactionSuccessScreen from '../../SendFunds/TransactionSuccessScreen';
import TransactionFailedScreen from '../../SendFunds/TransactionFailedScreen';

const CancelOrKillReferendaForm = dynamic(() => import('./Forms/CancelOrKillReferendaForm'), {
	loading: () => <Loader />,
	ssr: false
});

const CreateReferendaForm = dynamic(() => import('./Forms/CreateReferendaForm'), {
	loading: () => <Loader />,
	ssr: false
});

const ReferendaActionModal = ({ className }: { className?: string }) => {
	const [referendaModal, setReferendaModal] = useState<EReferenda>(EReferenda.CREATE_PROPOSAL);
	const [transactionData, seTransactionData] = useState<any>(null);
	const allMultisig = useMultisig();
	const [selectedMultisig, setSelectedMultisig] = useState<string>(allMultisig[0].label.address);
	const [network, setNetwork] = useState(allMultisig[0].label.network);
	const [isProxy, setIsProxy] = useState(false);
	const { address } = useGlobalUserDetailsContext();

	return (
		<div className={className}>
			{transactionData ? (
				transactionData.transactionState === 'success' ? (
					<TransactionSuccessScreen
						successMessage='Transaction in Progress!'
						waitMessage='All Threshold Signatories need to Approve the Transaction.'
						amount={BN_ZERO}
						txnHash={transactionData?.callHash}
						created_at={transactionData?.created_at || new Date()}
						sender={address}
						network={transactionData.network}
						recipients={[]}
					/>
				) : transactionData.transactionState === 'failed' ? (
					<TransactionFailedScreen
						txnHash={transactionData?.callHash || ''}
						sender={address}
						failedMessage='Oh no! Something went wrong.'
						waitMessage='Your transaction has failed due to some technical error. Please try again...Details of the transaction are included below'
						created_at={new Date()}
					/>
				) : null
			) : null}
			<Radio.Group
				value={referendaModal}
				onChange={(e) => setReferendaModal(e.target.value)}
			>
				<Radio
					className='text-primary [&>span>span]:border-primary'
					value={EReferenda.CREATE_PROPOSAL}
				>
					Create a Proposal
				</Radio>
				<Radio
					className='text-primary [&>span>span]:border-primary'
					value={EReferenda.KILL_PROPOSAL}
				>
					Kill a Proposal
				</Radio>
				<Radio
					className='text-primary [&>span>span]:border-primary'
					value={EReferenda.CANCEL_PROPOSAL}
				>
					Cancel a Proposal
				</Radio>
			</Radio.Group>
			<div className='mt-6 px-6'>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer w-[500px]'
					menu={{
						items: allMultisig.map((item) => ({ key: item.key, label: <AddressComponent {...item.label} /> })),
						onClick: (e) => {
							const data = JSON.parse(e.key);
							setSelectedMultisig(data?.address);
							setNetwork(data?.network);
							setIsProxy(data?.isProxy);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<AddressComponent
							isMultisig
							showNetworkBadge
							network={network}
							withBadge={false}
							address={selectedMultisig}
						/>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
				<div>
					{referendaModal === EReferenda.CREATE_PROPOSAL && (
						<CreateReferendaForm
							selectedMultisig={selectedMultisig}
							isProxySelected={isProxy}
							seTransactionData={seTransactionData}
						/>
					)}
					{referendaModal === EReferenda.CANCEL_PROPOSAL && (
						<CancelOrKillReferendaForm
							selectedMultisig={selectedMultisig}
							isProxySelected={isProxy}
							type={EKillOrCancel.CANCEL}
							seTransactionData={seTransactionData}
						/>
					)}
					{referendaModal === EReferenda.KILL_PROPOSAL && (
						<CancelOrKillReferendaForm
							selectedMultisig={selectedMultisig}
							isProxySelected={isProxy}
							type={EKillOrCancel.KILL}
							seTransactionData={seTransactionData}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default ReferendaActionModal;
