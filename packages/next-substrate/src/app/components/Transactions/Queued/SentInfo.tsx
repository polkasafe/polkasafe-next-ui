// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Button, Collapse, Divider, Input, Timeline } from 'antd';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useState } from 'react';
import CancelBtn from '@next-substrate/app/components/Multisig/CancelBtn';
import RemoveBtn from '@next-substrate/app/components/Settings/RemoveBtn';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress, ITxNotification, ITxnCategory } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import {
	ArrowRightIcon,
	CircleCheckIcon,
	CirclePlusIcon,
	CircleWatchIcon,
	CopyIcon,
	EditIcon,
	ExternalLinkIcon,
	WarningCircleIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getMultisigInfo from '@next-substrate/utils/getMultisigInfo';
import notify from '@next-substrate/utils/notify';
import parseDecodedValue from '@next-substrate/utils/parseDecodedValue';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import styled from 'styled-components';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { ApiPromise } from '@polkadot/api';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import ArgumentsTable from './ArgumentsTable';
import EditNote from './EditNote';
import NotifyButton from './NotifyButton';
import TransactionFields from '../TransactionFields';

interface ISentInfoProps {
	amount: string | string[];
	transactionFields?: ITxnCategory;
	amountUSD: string;
	date: string;
	// time: string;
	loading: boolean;
	approvals: string[];
	threshold: number;
	className?: string;
	callHash: string;
	callData: string;
	callDataString: string;
	recipientAddress?: string | string[];
	setCallDataString: React.Dispatch<React.SetStateAction<string>>;
	handleApproveTransaction: () => Promise<void>;
	handleCancelTransaction: () => Promise<void>;
	note: string;
	isProxyApproval: boolean;
	isProxyAddApproval: boolean;
	delegate_id?: string;
	isProxyRemovalApproval?: boolean;
	notifications?: ITxNotification;
	getMultiDataLoading?: boolean;
	customTx?: boolean;
	decodedCallData: any;
	txnParams: any;
	network: string;
	multisig: IMultisigAddress;
	api: ApiPromise;
	apiReady: boolean;
	category: string;
	multi_id: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	setApprovals: React.Dispatch<React.SetStateAction<string[]>>;
	setTransactionFields: React.Dispatch<React.SetStateAction<ITxnCategory>>;
}

const SentInfo: FC<ISentInfoProps> = ({
	note,
	decodedCallData,
	txnParams,
	transactionFields,
	getMultiDataLoading,
	delegate_id,
	isProxyAddApproval,
	isProxyRemovalApproval,
	isProxyApproval,
	amount,
	amountUSD,
	className,
	callData,
	callDataString,
	callHash,
	recipientAddress,
	date,
	approvals,
	loading,
	threshold,
	setCallDataString,
	handleApproveTransaction,
	handleCancelTransaction,
	notifications,
	customTx,
	network,
	multisig,
	api,
	apiReady,
	category,
	multi_id,
	setCategory,
	setApprovals,
	setTransactionFields
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	const { address: userAddress, addressBook, activeMultisig, notOwnerOfMultisig } = useGlobalUserDetailsContext();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
	const [openEditNoteModal, setOpenEditNoteModal] = useState<boolean>(false);

	const [updatedNote, setUpdatedNote] = useState(note);
	const [depositor, setDepositor] = useState<string>('');

	const fetchApprovals = useCallback(async () => {
		if (!multi_id || !callHash) return;

		const multisigDataRes = await fetch(`https://${network}.api.subscan.io/api/scan/multisig`, {
			body: JSON.stringify({
				call_hash: callHash,
				multi_id
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data } = await multisigDataRes.json();
		const a: string[] = data?.process
			?.filter((item: any) => item.status === 'Approval')
			.map((item: any) => item.account_display.address);

		setApprovals(a || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callHash, multi_id, network]);

	useEffect(() => {
		fetchApprovals();
	}, [fetchApprovals]);

	useEffect(() => {
		const getDepositor = async () => {
			if (!api || !apiReady) return;
			const multisigInfos = await getMultisigInfo(multisig?.address || activeMultisig, api);
			const [, multisigInfo] = multisigInfos?.find(([h]) => h.eq(callHash)) || [null, null];
			setDepositor(multisigInfo?.depositor?.toString() || '');
		};
		getDepositor();
	}, [activeMultisig, multisig?.address, api, callHash, apiReady]);

	const approvalReminder = async (address: string) => {
		const res = await notify({
			args: {
				address,
				callHash,
				multisigAddress: multisig?.address || activeMultisig,
				network
			},
			network,
			triggerName: 'approvalReminder'
		});

		if (res?.error) {
			throw new Error(res.error);
		}
	};

	return (
		<div className={classNames('flex gap-x-4 max-sm:flex-wrap max-sm:gap-2', className)}>
			<ModalComponent
				onCancel={() => setOpenCancelModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Cancel Transaction</h3>}
				open={openCancelModal}
			>
				<div className='flex flex-col h-full'>
					<div className='text-white'>Are you sure you want to cancel the Transaction?</div>
					<div className='flex items-center justify-between mt-[40px]'>
						<CancelBtn
							title='No'
							onClick={() => setOpenCancelModal(false)}
						/>
						<RemoveBtn
							title='Yes, Cancel'
							loading={loading}
							onClick={() => {
								handleCancelTransaction();
								setOpenCancelModal(false);
							}}
						/>
					</div>
				</div>
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenEditNoteModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Note</h3>}
				open={openEditNoteModal}
			>
				<EditNote
					note=''
					callHash={callHash}
					setUpdatedNote={setUpdatedNote}
					onCancel={() => setOpenEditNoteModal(false)}
				/>
			</ModalComponent>
			<article className='p-4 rounded-lg bg-bg-main flex-1 max-sm:flex-wrap'>
				{isProxyApproval ||
				isProxyAddApproval ||
				isProxyRemovalApproval ||
				getMultiDataLoading ||
				notOwnerOfMultisig ||
				customTx ? null : recipientAddress && amount && !customTx ? (
					typeof recipientAddress === 'string' ? (
						<>
							<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
								<span>Send</span>
								<span className='text-failure'>
									{amount
										? parseDecodedValue({
												network,
												value: String(amount),
												withUnit: true
										  })
										: `? ${chainProperties[network].tokenSymbol}`}{' '}
									{!Number.isNaN(Number(amountUSD)) && amount && (
										<span>
											(
											{(
												Number(amountUSD) *
												Number(
													parseDecodedValue({
														network,
														value: String(amount),
														withUnit: false
													})
												)
											).toFixed(2)}{' '}
											USD)
										</span>
									)}
								</span>
								<span>To:</span>
							</p>
							<div className='mt-3 flex items-center gap-x-4'>
								{recipientAddress && (
									<Identicon
										size={30}
										theme='polkadot'
										value={recipientAddress}
									/>
								)}
								<div className='flex flex-col gap-y-[6px]'>
									<p className='font-medium text-sm leading-[15px] text-white'>
										{recipientAddress
											? addressBook?.find((item) => item.address === recipientAddress)?.name || DEFAULT_ADDRESS_NAME
											: '?'}
									</p>
									{recipientAddress && (
										<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
											<span>{getEncodedAddress(recipientAddress, network)}</span>
											<span className='flex items-center gap-x-2 text-sm'>
												<button onClick={() => copyText(recipientAddress, true, network)}>
													<CopyIcon className='hover:text-primary' />
												</button>
												<a
													href={`https://${network}.subscan.io/account/${getEncodedAddress(recipientAddress, network)}`}
													target='_blank'
													rel='noreferrer'
												>
													<ExternalLinkIcon />
												</a>
											</span>
										</p>
									)}
								</div>
							</div>
						</>
					) : (
						<div className='flex flex-col gap-y-1'>
							{Array.isArray(recipientAddress) &&
								recipientAddress.map((item, i) => (
									<>
										<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
											<span>Send</span>
											<span className='text-failure'>
												{amount[i]
													? parseDecodedValue({
															network,
															value: String(amount[i]),
															withUnit: true
													  })
													: `? ${chainProperties[network].tokenSymbol}`}{' '}
												{!Number.isNaN(Number(amountUSD)) && amount[i] && (
													<span>
														(
														{(
															Number(amountUSD) *
															Number(currencyPrice) *
															Number(
																parseDecodedValue({
																	network,
																	value: String(amount[i]),
																	withUnit: false
																})
															)
														).toFixed(2)}{' '}
														{currencyProperties[currency].symbol})
													</span>
												)}
											</span>
											<span>To:</span>
										</p>
										<div className='mt-3 flex items-center gap-x-4'>
											{item && (
												<Identicon
													size={30}
													theme='polkadot'
													value={item}
												/>
											)}
											<div className='flex flex-col gap-y-[6px]'>
												<p className='font-medium text-sm leading-[15px] text-white'>
													{recipientAddress
														? addressBook?.find((a) => a.address === item)?.name || DEFAULT_ADDRESS_NAME
														: '?'}
												</p>
												{recipientAddress && (
													<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
														<span>{getEncodedAddress(item, network)}</span>
														<span className='flex items-center gap-x-2 text-sm'>
															<button onClick={() => copyText(item, true, network)}>
																<CopyIcon className='hover:text-primary' />
															</button>
															<a
																href={`https://${network}.subscan.io/account/${getEncodedAddress(item, network)}`}
																target='_blank'
																rel='noreferrer'
															>
																<ExternalLinkIcon />
															</a>
														</span>
													</p>
												)}
											</div>
										</div>
										{recipientAddress.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
									</>
								))}
						</div>
					)
				) : (
					<section className='w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg flex items-center gap-x-[11px]'>
						<span>
							<WarningCircleIcon className='text-base' />
						</span>
						<p className=''>Transaction was not created on Polkasafe, enter call data to fetch this data.</p>
					</section>
				)}
				{!callData && !notOwnerOfMultisig && (
					<Input
						size='large'
						placeholder='Enter Call Data.'
						className='w-full my-2 text-sm font-normal leading-[15px] border-0 outline-0 placeholder:text-[#505050] bg-bg-secondary rounded-md text-white'
						onChange={(e) => setCallDataString(e.target.value)}
					/>
				)}
				{!isProxyApproval && !isProxyAddApproval && !isProxyRemovalApproval && (
					<Divider className='bg-text_secondary my-5' />
				)}
				<div className='flex items-center gap-x-5 justify-between mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Created at:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{date}</span>
					</p>
				</div>
				{depositor && (
					<div className='flex items-center gap-x-5 justify-between mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Created by:</span>
						<AddressComponent address={depositor} />
					</div>
				)}
				{!!transactionFields &&
					Object.keys(transactionFields).length !== 0 &&
					transactionFields.category !== 'none' && (
						<>
							<p className='flex items-center justify-between mt-3'>
								<span className='text-text_secondary font-normal text-sm'>Category:</span>
								<TransactionFields
									callHash={callHash}
									category={category}
									setCategory={setCategory}
									transactionFieldsObject={transactionFields}
									setTransactionFieldsObject={setTransactionFields}
									multisigAddress={multisig.address}
									network={network}
								/>
							</p>
							{transactionFields &&
								transactionFields.subfields &&
								Object.keys(transactionFields?.subfields).map((key) => {
									const subfield = transactionFields.subfields[key];
									return (
										<div
											key={key}
											className='flex items-center justify-between mt-3'
										>
											<span className='text-text_secondary font-normal text-sm leading-[15px]'>{subfield.name}:</span>
											<span className='text-waiting bg-waiting bg-opacity-5 border border-solid border-waiting rounded-lg px-[6px] py-[3px]'>
												{subfield.value}
											</span>
										</div>
									);
								})}
						</>
					)}
				<div className='flex items-center gap-x-5 justify-between mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Note:</span>
					<span className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						{updatedNote ? (
							<span className='text-white font-normal flex items-center flex-wrap gap-x-3'>
								<p className='whitespace-pre'>{updatedNote}</p>
								{depositor === getEncodedAddress(userAddress, network) && (
									<button onClick={() => setOpenEditNoteModal(true)}>
										<EditIcon className='text-primary cursor-pointer' />
									</button>
								)}
							</span>
						) : (
							depositor === getEncodedAddress(userAddress, network) && (
								<button onClick={() => setOpenEditNoteModal(true)}>
									<EditIcon className='text-primary cursor-pointer' />
								</button>
							)
						)}
					</span>
				</div>
				{showDetails && (
					<>
						{delegate_id && (
							<div className='flex items-center gap-x-5 justify-between mt-3'>
								<span className='text-text_secondary font-normal text-sm leading-[15px]'>
									{isProxyAddApproval ? 'Multisig to Add' : isProxyRemovalApproval ? 'Multisig to Remove' : ''}:
								</span>
								<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
									<Identicon
										value={delegate_id}
										size={20}
										theme='polkadot'
									/>
									<span className='text-white font-normal text-sm leading-[15px]'>
										{' '}
										{shortenAddress(delegate_id, 10)}
									</span>
									<span className='flex items-center gap-x-2 text-sm'>
										<button onClick={() => copyText(delegate_id)}>
											<CopyIcon className='hover:text-primary' />
										</button>
									</span>
								</p>
							</div>
						)}
						<div className='flex items-center gap-x-5 justify-between mt-3'>
							<span className='text-text_secondary font-normal text-sm leading-[15px]'>Txn Hash:</span>
							<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
								<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callHash, 10)}</span>
								<span className='flex items-center gap-x-2 text-sm'>
									<button onClick={() => copyText(callHash)}>
										<CopyIcon className='hover:text-primary' />
									</button>
									{/* <ExternalLinkIcon /> */}
								</span>
							</p>
						</div>
						{callData && (
							<div className='flex items-center gap-x-5 justify-between mt-3'>
								<span className='text-text_secondary font-normal text-sm leading-[15px]'>Call Data:</span>
								<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
									<span className='text-white font-normal text-sm leading-[15px]'> {shortenAddress(callData, 10)}</span>
									<span className='flex items-center gap-x-2 text-sm'>
										<button onClick={() => copyText(callData)}>
											<CopyIcon className='hover:text-primary' />
										</button>
									</span>
								</p>
							</div>
						)}
						{callData && txnParams && decodedCallData && (
							<>
								<Divider
									className='border-bg-secondary text-text_secondary my-5'
									orientation='left'
								>
									Decoded Call
								</Divider>
								<ArgumentsTable
									api={api}
									apiReady={apiReady}
									network={network}
									callData={callDataString}
								/>
							</>
						)}
					</>
				)}
				{/* <div
					className='flex items-center justify-between gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
							Executed:
					</span>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span
							className='text-white font-normal text-sm leading-[15px]'
						>
							{date}
						</span>
					</p>
				</div> */}
				<p
					onClick={() => setShowDetails((prev) => !prev)}
					className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-5 flex items-center gap-x-3'
				>
					<span>{showDetails ? 'Hide' : 'Advanced'} Details</span>
					<ArrowRightIcon />
				</p>
			</article>
			<article className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'>
				<div>
					<Timeline className=''>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CirclePlusIcon className='text-success text-sm' />
								</span>
							}
							className='success'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>Created</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>
								Confirmations{' '}
								<span className='text-text_secondary'>
									{approvals.length} of {threshold}
								</span>
							</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-waiting bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-waiting text-sm' />
								</span>
							}
							className='warning'
						>
							<Collapse bordered={false}>
								<Collapse.Panel
									showArrow={false}
									key={1}
									header={
										<span className='text-primary font-normal text-sm leading-[15px] px-3 py-2 rounded-md bg-highlight max-sm:text-xs'>
											Show All Confirmations
										</span>
									}
								>
									<Timeline>
										{approvals.map((address, i) => (
											<Timeline.Item
												key={i}
												dot={
													<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
														<CircleCheckIcon className='text-success text-sm' />
													</span>
												}
												className={`${i === 0 && 'mt-4'} success bg-transaparent`}
											>
												<div className='mb-3 flex items-center gap-x-4 max-sm:text-xs'>
													<AddressComponent
														address={address}
														network={network}
													/>
												</div>
											</Timeline.Item>
										))}

										{multisig?.signatories
											.filter((item) => {
												const encodedApprovals = approvals.map((a) => getEncodedAddress(a, network));
												return !encodedApprovals.includes(getEncodedAddress(item, network));
											})
											.map((address, i) => {
												let hoursDifference;
												if (notifications?.[address]?.lastNotified) {
													const olderDate = new Date(notifications?.[address].lastNotified);
													const currentDate = new Date();
													const timeDifference = currentDate.getTime() - olderDate.getTime();
													hoursDifference = timeDifference / (1000 * 60 * 60);
												}
												return (
													<Timeline.Item
														key={i}
														dot={
															<span className='bg-waiting bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
																<CircleWatchIcon className='text-waiting text-sm' />
															</span>
														}
														className='warning bg-transaparent'
													>
														<div className='mb-3 flex items-center gap-x-4 relative'>
															<AddressComponent
																address={address}
																network={network}
															/>
															{depositor === getEncodedAddress(userAddress, network) && (
																<NotifyButton
																	address={address}
																	onClick={approvalReminder}
																	canNotificationSend={hoursDifference === undefined || hoursDifference > 8}
																/>
															)}
															{/* <Identicon
															value={address}
															size={30}
															theme='polkadot'
														/>
														<div
															className='flex flex-col gap-y-[6px]'
														>
															<p
																className='font-medium text-sm leading-[15px] text-white'
															>
																{addressBook?.find((item) => item.address === address)?.name || DEFAULT_ADDRESS_NAME}
															</p>
															<p
																className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
															>
																<span>
																	{shortenAddress(getEncodedAddress(address, network) || '')}
																</span>
																<span
																	className='flex items-center gap-x-2 text-sm'
																>
																	<button onClick={() => copyText(address, true, network)}><CopyIcon className='hover:text-primary'/></button>
																	<a href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`} target='_blank' rel="noreferrer" >
																		<ExternalLinkIcon  />
																	</a>
																</span>
															</p>
														</div> */}
														</div>
													</Timeline.Item>
												);
											})}
									</Timeline>
								</Collapse.Panel>
							</Collapse>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-waiting bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-waiting text-sm' />
								</span>
							}
							className='warning'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>
								<p>Executed</p>
								<div className='mt-2 text-text_secondary text-sm'>
									The transaction will be executed once the threshold is reached.
								</div>
							</div>
						</Timeline.Item>
					</Timeline>
					<div className='w-full mt-3 flex flex-col gap-y-2 items-center'>
						{!approvals.includes(getEncodedAddress(userAddress, network)) && (
							<Button
								disabled={
									notOwnerOfMultisig ||
									approvals.includes(getEncodedAddress(userAddress, network)) ||
									!decodedCallData ||
									(approvals.length === threshold - 1 && !callDataString)
								}
								loading={loading}
								onClick={handleApproveTransaction}
								className={`w-full border-none text-sm font-normal ${
									approvals.includes(getEncodedAddress(userAddress, network)) ||
									!decodedCallData ||
									(approvals.length === threshold - 1 && !callDataString)
										? 'bg-highlight text-text_secondary'
										: 'bg-primary text-white'
								}`}
							>
								Approve Transaction
							</Button>
						)}
						{depositor === getEncodedAddress(userAddress, network) && (
							<Button
								disabled={notOwnerOfMultisig || !callDataString || !decodedCallData}
								loading={loading}
								onClick={() => setOpenCancelModal(true)}
								className={`w-full border-none text-white text-sm font-normal bg-failure ${
									(!callDataString || !decodedCallData) && 'bg-opacity-10 text-text_secondary'
								}`}
							>
								Cancel Transaction
							</Button>
						)}
					</div>
				</div>
			</article>
		</div>
	);
};

export default styled(SentInfo)`
	.ant-collapse > .ant-collapse-item > .ant-collapse-header {
		padding: 4px 8px;
	}
	.ant-timeline-item-tail {
		border-inline-width: 0.5px !important;
	}
	.ant-timeline-item-last {
		padding: 0;
	}
	.ant-timeline-item:not(:first-child, :last-child) {
		margin-top: 5px;
		margin-bottom: 5px;
	}
	.ant-timeline-item-content {
		display: flex;
		min-height: 24px !important;
		height: auto !important;
		align-items: center;
	}
	.success .ant-timeline-item-tail {
		border-inline-color: #06d6a0;
	}
	.warning .ant-timeline-item-tail {
		border-inline-color: #ff9f1c;
	}
`;
