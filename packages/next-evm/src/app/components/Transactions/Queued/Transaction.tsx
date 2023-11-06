// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Divider, Skeleton } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ITransaction, NotificationStatus } from '@next-common/types';
import { ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from '@next-common/ui-components/CustomIcons';
import LoadingModal from '@next-common/ui-components/LoadingModal';
import queueNotification from '@next-common/ui-components/QueueNotification';

import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import updateMultisigTransactions from '@next-evm/utils/updateHistoryTransaction';
import SentInfo from './SentInfo';

interface ITransactionProps {
	date: Date;
	approvals: string[];
	threshold: number;
	callData: string;
	callHash: string;
	value: string;
	onAfterApprove?: any;
	onAfterExecute?: any;
	txType?: any;
	recipientAddress?: string;
}

const Transaction: FC<ITransactionProps> = ({
	approvals,
	callData,
	callHash,
	date,
	threshold,
	value,
	onAfterApprove,
	onAfterExecute,
	txType,
	recipientAddress
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { activeMultisig, address, gnosisSafe } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [getMultiDataLoading] = useState(false);
	const [loadingMessages, setLoadingMessage] = useState('');
	const [openLoadingModal, setOpenLoadingModal] = useState(false);
	const { network } = useGlobalApiContext();

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const router = useRouter();

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [callDataString] = useState<string>(callData || '');
	const [transactionDetails, setTransactionDetails] = useState<ITransaction>({} as any);
	const token = chainProperties[network].tokenSymbol;
	// const hash = location.hash.slice(1);
	const [transactionDetailsLoading, setTransactionDetailsLoading] = useState<boolean>(false);

	const getTransactionDetails = useCallback(async () => {
		setTransactionDetailsLoading(true);
		const { data: getTransactionData, error: getTransactionErr } = await nextApiClientFetch<ITransaction>(
			`${EVM_API_URL}/getTransactionDetailsEth`,
			{ callHash },
			{ network }
		);

		if (!getTransactionErr && getTransactionData) {
			setTransactionDetails(getTransactionData);
		}
		setTransactionDetailsLoading(false);
	}, [callHash, network]);
	useEffect(() => {
		getTransactionDetails();
	}, [getTransactionDetails]);

	useEffect(() => {
		if (!callData) return;
		gnosisSafe.safeService
			.decodeData(callData)
			.then((res) => setDecodedCallData(res))
			.catch((e) => console.log(e));
	}, [callData, gnosisSafe]);

	const handleApproveTransaction = async () => {
		setLoading(true);
		try {
			const response = await gnosisSafe.signAndConfirmTx(callHash, activeMultisig);
			if (response) {
				const updateTx = {
					signer: address,
					txHash: callHash,
					txSignature: response
				};
				await updateMultisigTransactions({ address, network, txBody: updateTx });
				onAfterApprove(callHash);
				setSuccess(true);
				setLoadingMessage('Transaction Signed Successfully.');
				queueNotification({
					header: 'Success!',
					message: 'Transaction Approved',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.log(error);
			// eslint-disable-next-line sonarjs/no-duplicate-string
			setLoadingMessage('Something went wrong! Please try again.');
			queueNotification({
				header: 'Error!',
				message: 'Error in Approving the transaction',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	const handleExecuteTransaction = async () => {
		setLoading(true);
		try {
			const { data: response, error } = await gnosisSafe.executeTx(callHash, activeMultisig);
			if (error) {
				queueNotification({
					header: 'Execution Failed',
					message: 'Please try Again',
					status: NotificationStatus.ERROR
				});
			}
			if (response) {
				queueNotification({
					header: 'Execution started',
					message: 'Your transaction is executing, it might take a bit time.',
					status: NotificationStatus.INFO
				});
				await response.transactionResponse?.wait();
				const completeTx = {
					// eslint-disable-next-line sonarjs/no-gratuitous-expressions
					receipt: response || {},
					txHash: callHash
				};
				await nextApiClientFetch(`${EVM_API_URL}/completeTransactionEth`, completeTx, { network });
				onAfterExecute(callHash);
				queueNotification({
					header: 'Transaction Executed',
					message: 'Your transaction has been executed successfully.',
					status: NotificationStatus.SUCCESS
				});
				setSuccess(true);
				if (txType === 'addOwnerWithThreshold' || txType === 'removeOwner') router.push('/');
			}
		} catch (error) {
			console.log(error);
			setLoadingMessage('Something went wrong! Please try again.');
			queueNotification({
				header: 'Something went wrong! Please try again.',
				message: error.message || error,
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
			bordered={false}
			// defaultActiveKey={[`${hash}`]}
		>
			<Collapse.Panel
				showArrow={false}
				key={`${callHash}`}
				header={
					getMultiDataLoading ? (
						<Skeleton
							active
							paragraph={{ rows: 0 }}
						/>
					) : (
						<div
							onClick={() => {
								toggleTransactionVisible(!transactionInfoVisible);
							}}
							className={classNames(
								'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
							)}
						>
							<p className='col-span-3 flex items-center gap-x-3'>
								<span
									className={`flex items-center justify-center w-9 h-9 ${
										txType === 'addOwnerWithThreshold' || txType === 'removeOwner'
											? 'bg-[#FF79F2] text-[#FF79F2]'
											: 'bg-success text-red-500'
									} bg-opacity-10 p-[10px] rounded-lg`}
								>
									<ArrowUpRightIcon />
								</span>

								<span>
									{txType === 'addOwnerWithThreshold'
										? 'Adding New Owner'
										: txType === 'removeOwner'
										? 'Removing Owner'
										: txType === 'Sent' || txType === 'transfer'
										? 'Send'
										: 'Custom Transaction'}
								</span>
							</p>
							{!(txType === 'addOwnerWithThreshold' || txType === 'removeOwner') && (
								<p className='col-span-2 flex items-center gap-x-[6px]'>
									<ParachainIcon src={chainProperties[network].logo} />
									<span className='font-normal text-xs leading-[13px] text-failure'>
										{ethers.utils.formatEther(transactionDetails.amount_token || value).toString()} {token}
									</span>
								</p>
							)}
							<p className='col-span-2'>{dayjs(date).format('lll')}</p>
							<p
								className={`${
									txType === 'addOwnerWithThreshold' || txType === 'removeOwner' ? 'col-span-4' : 'col-span-2'
								} flex items-center justify-end gap-x-4`}
							>
								<span className='text-waiting'>
									{!approvals.includes(address) && 'Awaiting your Confirmation'} ({approvals.length}/{threshold})
								</span>
								<span className='text-white text-sm'>
									{transactionInfoVisible ? <CircleArrowUpIcon /> : <CircleArrowDownIcon />}
								</span>
							</p>
						</div>
					)
				}
			>
				<LoadingModal
					message={loadingMessages}
					loading={loading}
					success={success}
					open={openLoadingModal}
					onCancel={() => setOpenLoadingModal(false)}
				/>

				<div>
					<Divider className='bg-text_secondary my-5' />
					<SentInfo
						amount={
							decodedCallData.method === 'multiSend'
								? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.value)
								: value
						}
						addressAddOrRemove={
							txType === 'addOwnerWithThreshold'
								? decodedCallData.parameters?.[0]?.value
								: txType === 'removeOwner'
								? decodedCallData.parameters?.[1]?.value
								: ''
						}
						callHash={callHash}
						recipientAddress={
							decodedCallData.method === 'multiSend'
								? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.to)
								: recipientAddress || ''
						}
						callDataString={callDataString}
						callData={callData}
						date={date}
						approvals={approvals}
						threshold={threshold}
						loading={loading}
						handleApproveTransaction={handleApproveTransaction}
						handleExecuteTransaction={handleExecuteTransaction}
						handleCancelTransaction={async () => {}}
						note={transactionDetails.note || ''}
						txType={txType}
						transactionFields={transactionDetails.transactionFields}
						transactionDetailsLoading={transactionDetailsLoading}
					/>
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
