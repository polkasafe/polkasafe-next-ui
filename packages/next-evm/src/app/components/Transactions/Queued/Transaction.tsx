// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/naming-convention */
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
import {
	ArrowUpRightIcon,
	CircleArrowDownIcon,
	CircleArrowUpIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import LoadingModal from '@next-common/ui-components/LoadingModal';
import queueNotification from '@next-common/ui-components/QueueNotification';

import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import updateMultisigTransactions from '@next-evm/utils/updateHistoryTransaction';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import { StaticImageData } from 'next/image';
import formatBalance from '@next-evm/utils/formatBalance';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import SentInfo from './SentInfo';
import ReplaceTxnModal from './ReplaceTxnModal';

export interface ITransactionProps {
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
	advancedDetails: any;
	refetchTxns: () => void;
	canCancelTx: boolean;
	setCanCancelTx: React.Dispatch<React.SetStateAction<boolean>>;
}

const Transaction: FC<ITransactionProps> = ({
	advancedDetails,
	approvals,
	callData,
	callHash,
	date,
	threshold,
	value,
	onAfterApprove,
	onAfterExecute,
	txType,
	recipientAddress,
	refetchTxns,
	canCancelTx,
	setCanCancelTx
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { activeMultisig, address, gnosisSafe } = useGlobalUserDetailsContext();
	const { allAssets } = useMultisigAssetsContext();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [getMultiDataLoading] = useState(false);
	const [loadingMessages, setLoadingMessage] = useState('');
	const [openLoadingModal, setOpenLoadingModal] = useState(false);
	const { network } = useGlobalApiContext();

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [amount, setAmount] = useState(value);

	const router = useRouter();

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [transactionDetails, setTransactionDetails] = useState<ITransaction>({} as any);

	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);
	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [tokenDetailsArray, setTokenDetailsArray] = useState<
		{ tokenSymbol: string; tokenDecimals: number; tokenLogo: StaticImageData | string; tokenAddress: string }[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const token = chainProperties[network].tokenSymbol;
	// const hash = location.hash.slice(1);
	const [transactionDetailsLoading, setTransactionDetailsLoading] = useState<boolean>(false);

	const [openReplaceTxnModal, setOpenReplaceTxnModal] = useState<boolean>(false);

	const urlHash = typeof window !== 'undefined' && window.location.hash.slice(1);

	const getTxDetails = useCallback(async () => {
		setTransactionDetailsLoading(true);

		const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), callHash);

		setTxData(txDetails.txData);
		setTxInfo(txDetails.txInfo);

		if (txDetails.txInfo.type === 'Custom' && txDetails.txInfo.isCancellation) {
			setCanCancelTx(false);
		}

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
		getTxDetails();
	}, [getTxDetails]);

	useEffect(() => {
		if (!callData) return;
		gnosisSafe.safeService
			.decodeData(callData)
			.then((res) => setDecodedCallData(res))
			.catch((e) => console.log(e));
	}, [callData, gnosisSafe]);

	useEffect(() => {
		if (decodedCallData && decodedCallData?.method === 'multiSend') {
			if (txData && txData.addressInfoIndex && Object.keys(txData.addressInfoIndex)?.length > 0) {
				const tokenContractAddressArray: string[] = decodedCallData?.parameters?.[0]?.valueDecoded?.map(
					(item: any) => item?.to
				);

				const realContractAddresses = Object.keys(txData.addressInfoIndex);
				const tokenDetails = [];
				tokenContractAddressArray.forEach((item) => {
					if (realContractAddresses.includes(item)) {
						const assetDetails = allAssets.find((asset) => asset.tokenAddress === item);
						tokenDetails.push({
							tokenAddress: assetDetails?.tokenAddress || '',
							tokenDecimals: assetDetails?.token_decimals || chainProperties[network].decimals,
							tokenLogo: assetDetails?.logoURI || chainProperties[network].logo,
							tokenSymbol: assetDetails?.name || chainProperties[network].tokenSymbol
						});
					} else {
						tokenDetails.push({
							tokenAddress: '',
							tokenDecimals: chainProperties[network].decimals,
							tokenLogo: chainProperties[network].logo,
							tokenSymbol: chainProperties[network].tokenSymbol
						});
					}
				});
				setTokenDetailsArray(tokenDetails);
			} else {
				setTokenDetailsArray([
					{
						tokenAddress: '',
						tokenDecimals: chainProperties[network].decimals,
						tokenLogo: chainProperties[network].logo,
						tokenSymbol: chainProperties[network].tokenSymbol
					}
				]);
			}

			const amountsArray = decodedCallData?.parameters?.[0]?.valueDecoded?.map(
				(item: any) => item?.dataDecoded?.parameters?.[1]?.value
			);
			const totalAmount = amountsArray?.reduce((sum: number, a: string) => {
				return sum + Number(a);
			}, 0);
			setAmount(totalAmount);
		}
	}, [allAssets, decodedCallData, network, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

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
			defaultActiveKey={[`${urlHash}`]}
		>
			<ModalComponent
				title='Replace Transaction'
				onCancel={() => setOpenReplaceTxnModal(false)}
				open={openReplaceTxnModal}
			>
				<ReplaceTxnModal
					onCancel={() => setOpenReplaceTxnModal(false)}
					txNonce={advancedDetails?.nonce || 0}
					refetchTxns={refetchTxns}
					canCancelTx={canCancelTx}
				/>
			</ModalComponent>
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
							<p className='col-span-5 flex items-center gap-x-3'>
								<span
									className={`flex items-center justify-center w-9 h-9 ${
										txType === 'addOwnerWithThreshold' || txType === 'removeOwner'
											? 'bg-[#FF79F2] text-[#FF79F2]'
											: 'bg-success text-red-500'
									} bg-opacity-10 p-[10px] rounded-lg`}
								>
									{txInfo?.type === 'Custom' && txInfo?.isCancellation ? (
										<span className='flex items-center justify-center p-1 border border-failure rounded-full w-[15px] h-[15px]'>
											<OutlineCloseIcon className='w-[6px] h-[6px]' />
										</span>
									) : (
										<ArrowUpRightIcon />
									)}
								</span>

								<span>
									{txType === 'addOwnerWithThreshold' ? (
										'Adding New Owner'
									) : txType === 'removeOwner' ? (
										'Removing Owner'
									) : txInfo?.type === 'Custom' && txInfo?.isCancellation ? (
										'On-chain Rejection'
									) : txType === 'Sent' || txType === 'transfer' || txType === 'multiSend' ? (
										isMultiTokenTx ? (
											<div className='flex gap-x-2'>
												Send Multiple Tokens
												{tokenDetailsArray.map((item) => (
													<ParachainIcon
														tooltip={item.tokenSymbol}
														src={item.tokenLogo}
													/>
												))}
											</div>
										) : (
											<p className='flex items-center gap-x-2'>
												Send
												<ParachainIcon
													src={
														decodedCallData?.method === 'multiSend'
															? tokenDetailsArray[0]?.tokenLogo
															: txInfo?.transferInfo?.logoUri || chainProperties[network].logo
													}
												/>
												<span className='font-normal text-xs leading-[13px] text-failure'>
													{formatBalance(
														ethers.utils.formatUnits(
															decodedCallData?.method === 'multiSend'
																? BigInt(amount).toString()
																: txInfo?.transferInfo?.value || value || transactionDetails.amount_token,
															decodedCallData?.method === 'multiSend'
																? tokenDetailsArray[0]?.tokenDecimals
																: txInfo?.transferInfo?.decimals || chainProperties[network].decimals
														)
													)}{' '}
													{decodedCallData?.method === 'multiSend'
														? tokenDetailsArray[0]?.tokenSymbol
														: txInfo?.transferInfo?.tokenSymbol || token}
												</span>
												To{' '}
												{decodedCallData.method === 'multiSend' ? (
													'Multiple Addresses'
												) : (
													<AddressComponent
														onlyAddress
														iconSize={25}
														withBadge={false}
														address={txInfo?.recipient?.value || recipientAddress || ''}
													/>
												)}
											</p>
										)
									) : (
										'Custom Transaction'
									)}
								</span>
							</p>
							<p className='col-span-2'>{dayjs(date).format('lll')}</p>
							<p
								className={`${
									txType === 'addOwnerWithThreshold' || txType === 'removeOwner' ? 'col-span-4' : 'col-span-2'
								} flex items-center justify-end gap-x-4`}
							>
								<span className='text-waiting'>
									{!approvals.includes(address)
										? 'Needs Your Confirmation'
										: approvals.length === threshold
										? 'Awaiting Execution'
										: 'Awaiting Confirmations'}{' '}
									({approvals.length}/{threshold})
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
								? decodedCallData?.parameters?.[0]?.valueDecoded?.map(
										(item: any) => item?.dataDecoded?.parameters?.[1]?.value
								  )
								: txInfo?.transferInfo?.value || value
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
								? decodedCallData?.parameters?.[0]?.valueDecoded?.map(
										(item: any) => item?.dataDecoded?.parameters?.[0]?.value
								  )
								: txInfo?.recipient?.value || recipientAddress || ''
						}
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
						tokenSymbol={txInfo?.transferInfo?.tokenSymbol}
						tokenDecimals={txInfo?.transferInfo?.decimals}
						multiSendTokens={tokenDetailsArray}
						advancedDetails={advancedDetails}
						isRejectionTxn={txInfo?.type === 'Custom' && txInfo?.isCancellation}
						setOpenReplaceTxnModal={setOpenReplaceTxnModal}
					/>
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
