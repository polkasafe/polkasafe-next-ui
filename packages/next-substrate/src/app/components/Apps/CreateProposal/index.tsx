/* eslint-disable react/jsx-props-no-spreading */
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@next-common/ui-components/Loader';
import styled from 'styled-components';
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

const ReferendaActionModal = ({ className }: { className: string }) => {
	const [referendaModal, setReferendaModal] = useState<EReferenda>(EReferenda.CREATE_PROPOSAL);
	const [transactionData, seTransactionData] = useState<any>(null);
	const allMultisig = useMultisig();
	const [selectedMultisig, setSelectedMultisig] = useState<string>(allMultisig[0].label.address);
	const [network, setNetwork] = useState(allMultisig[0].label.network);
	const [isProxy, setIsProxy] = useState(false);
	const { address } = useGlobalUserDetailsContext();

	return (
		<div className={className}>
			{transactionData.transactionState === 'success' ? (
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

export default styled(ReferendaActionModal)`
	.opengov-proposals .ant-modal-content {
		padding: 16px 0px !important;
	}
	.opengov-proposals .ant-modal-close {
		margin-top: 2px;
	}
	.opengov-proposals .ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: var(--pink_primary);
		stroke-width: 6px;
		background: red;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		color: #7788a1 !important;
		font-weight: 700 !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		font-weight: 700 !important;
	}
	.opengov-proposals
		.ant-steps
		.ant-steps-item-wait
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title,
	.opengov-proposals
		.ant-steps
		.ant-steps-item-finish
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title,
	.opengov-proposals
		.ant-steps
		.ant-steps-item-active
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title {
		font-size: 14px !important;
		color: #96a4b6 !important;
		line-height: 21px !important;
		font-weight: 500 !important;
	}
	.opengov-proposals
		.ant-steps
		.ant-steps-item-finish
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title,
	.opengov-proposals
		.ant-steps
		.ant-steps-item-active
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title {
		color: var(--bodyBlue) !important;
	}
	.opengov-proposals
		.ant-steps
		.ant-steps-item-wait
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title {
		color: #96a4b6 !important;
	}
	.ant-steps .ant-steps-item .ant-steps-item-container .ant-steps-item-tail {
		top: 0px !important;
		padding: 4px 15px !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after,
	.opengov-proposals .ant-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
	.opengov-proposals .ant-steps .ant-steps-item-tail::after {
		background-color: #d2d8e0 !important;
	}
	.opengov-proposals .ant-steps.ant-steps-label-vertical .ant-steps-item-content {
		width: 100% !important;
		display: flex !important;
		margin-top: 8px;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
		background: #51d36e;
		border: none !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
		color: white !important;
	}
	.opengov-proposals
		.ant-steps
		.ant-steps-item-finish
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title,
	.opengov-proposals
		.ant-steps
		.ant-steps-item-active
		.ant-steps-item-container
		.ant-steps-item-content
		.ant-steps-item-title {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
	}
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: ${(props) => (props.theme === 'dark' ? '#dde4ed' : 'rgba(0, 0, 0, 0.06)')} !important;
	}
`;
