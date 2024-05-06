// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Collapse, Divider, Timeline } from 'antd';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties } from '@next-common/global/networkConstants';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import {
	ArrowRightIcon,
	CircleCheckIcon,
	CirclePlusIcon,
	CircleWatchIcon,
	CopyIcon,
	ExternalLinkIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import parseDecodedValue from '@next-substrate/utils/parseDecodedValue';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import styled from 'styled-components';

import { ApiPromise } from '@polkadot/api';
import { ITxnCategory } from '@next-common/types';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import ArgumentsTable from '../Queued/ArgumentsTable';
import TransactionFields from '../TransactionFields';

interface ISentInfoProps {
	callData?: string;
	recipientAddresses?: string | string[];
	amount: string | string[];
	date: string;
	// time: string;
	className?: string;
	callHash: string;
	note?: string;
	transactionFields?: ITxnCategory;
	amount_usd: number;
	from: string;
	txnParams?: { method: string; section: string };
	customTx: boolean;
	network: string;
	api: ApiPromise;
	apiReady: boolean;
	multisigAddress: string;
	category: string;
	multi_id: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	setTransactionFields: React.Dispatch<React.SetStateAction<ITxnCategory>>;
}

const SentInfo: FC<ISentInfoProps> = ({
	amount,
	callData,
	customTx,
	txnParams,
	recipientAddresses,
	from,
	amount_usd,
	className,
	date,
	callHash,
	transactionFields,
	note,
	network,
	api,
	apiReady,
	category,
	setCategory,
	setTransactionFields,
	multisigAddress,
	multi_id
}) => {
	const { activeOrg } = useActiveOrgContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();
	const [showDetails, setShowDetails] = useState<boolean>(false);

	const [approvals, setApprovals] = useState<string[]>([]);

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
			?.filter((item: any) => item.status === 'Approval' || item.status === 'Executed')
			.map((item: any) => item.account_display.address);

		setApprovals(a || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callHash, multi_id, network]);

	useEffect(() => {
		fetchApprovals();
	}, [fetchApprovals]);

	return (
		<div className={classNames('flex gap-x-4 max-sm:flex-wrap max-sm:gap-2', className)}>
			<article className='p-4 rounded-lg bg-bg-main flex-1 max-sm:flex-wrap'>
				{customTx ? null : typeof recipientAddresses === 'string' ? (
					<>
						<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px] max-sm:gap-3'>
							<span>Sent</span>
							<span className='text-failure'>
								{amount
									? parseDecodedValue({
											network,
											value: String(amount),
											withUnit: true
									  })
									: `? ${chainProperties[network].tokenSymbol}`}{' '}
								{!Number.isNaN(Number(amount_usd)) && amount && (
									<span>
										(
										{(
											Number(amount_usd) *
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
							<span className='max-sm:hidden'>To:</span>
						</p>
						<div className='mt-3 flex items-center gap-x-4 max-sm:hidden'>
							{recipientAddresses && (
								<Identicon
									size={30}
									theme='polkadot'
									value={recipientAddresses}
								/>
							)}
							<div className='flex flex-col gap-y-[6px]'>
								<p className='font-medium text-sm leading-[15px] text-white'>
									{recipientAddresses
										? activeOrg?.addressBook?.find((item) => item.address === recipientAddresses)?.name ||
										  DEFAULT_ADDRESS_NAME
										: '?'}
								</p>
								{recipientAddresses && (
									<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
										<span>{getEncodedAddress(recipientAddresses, network)}</span>
										<span className='flex items-center gap-x-2 text-sm'>
											<button onClick={() => copyText(recipientAddresses, true, network)}>
												<CopyIcon className='hover:text-primary' />
											</button>
											<a
												href={`https://${network}.subscan.io/account/${getEncodedAddress(recipientAddresses, network)}`}
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
						<div className=' flex items-center justify-between gap-x-7 my-3 sm:hidden'>
							<span className='text-white font-normal text-sm leading-[15px]'>To:</span>
							<AddressComponent
								address={recipientAddresses}
								network={network}
							/>
						</div>
					</>
				) : (
					<div className='flex flex-col gap-y-1'>
						{Array.isArray(recipientAddresses) &&
							recipientAddresses.map((item, i) => (
								<>
									<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
										<span>Sent</span>
										<span className='text-failure'>
											{amount[i]
												? parseDecodedValue({
														network,
														value: String(amount[i]),
														withUnit: true
												  })
												: `? ${chainProperties[network].tokenSymbol}`}{' '}
											{!Number.isNaN(Number(amount_usd)) && amount[i] && (
												<span>
													(
													{(
														Number(amount_usd) *
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
												{recipientAddresses
													? activeOrg?.addressBook?.find((a) => a.address === item)?.name || DEFAULT_ADDRESS_NAME
													: '?'}
											</p>
											{recipientAddresses && (
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
									{recipientAddresses.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
								</>
							))}
					</div>
				)}
				<div className='flex items-center justify-between gap-x-7 mt-3 max-sm:gap-x-2'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>From:</span>
					<AddressComponent address={from} />
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Executed:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{date}</span>
					</p>
				</div>
				{!!transactionFields && Object.keys(transactionFields).length !== 0 && (
					<>
						<div className='flex items-center justify-between mt-3'>
							<span className='text-text_secondary font-normal text-sm leading-[15px]'>Category:</span>
							<TransactionFields
								callHash={callHash}
								category={category}
								setCategory={setCategory}
								transactionFieldsObject={transactionFields}
								setTransactionFieldsObject={setTransactionFields}
								multisigAddress={multisigAddress}
								network={network}
							/>
						</div>
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
				{note && (
					<div className='flex items-center justify-between mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Note:</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<span className='text-white font-normal text-sm leading-[15px] whitespace-pre'>{note}</span>
						</p>
					</div>
				)}
				<p
					onClick={() => setShowDetails((prev) => !prev)}
					className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-5 flex items-center gap-x-3'
				>
					<span>{showDetails ? 'Hide' : 'Advanced'} Details</span>
					<ArrowRightIcon />
				</p>
				{showDetails && (
					<>
						{callData && (
							<div className='flex items-center justify-between gap-x-5 mt-3'>
								<span className='text-text_secondary font-normal text-sm leading-[15px]'>Call Data:</span>
								<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
									<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callData, 5)}</span>
									<span className='flex items-center gap-x-2 text-sm'>
										<button onClick={() => copyText(callData)}>
											<CopyIcon />
										</button>
										{/* <ExternalLinkIcon /> */}
									</span>
								</p>
							</div>
						)}
						<div className='flex items-center justify-between gap-x-5 mt-3'>
							<span className='text-text_secondary font-normal text-sm leading-[15px]'>Txn Hash:</span>
							<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
								<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callHash, 5)}</span>
								<span className='flex items-center gap-x-2 text-sm'>
									<button onClick={() => copyText(callHash)}>
										<CopyIcon />
									</button>
									{/* <ExternalLinkIcon /> */}
								</span>
							</p>
						</div>
						{callData && txnParams && (
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
									callData={callData}
								/>
							</>
						)}
					</>
				)}
			</article>
			<article className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'>
				<div>
					<Timeline className='h-full flex flex-col'>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CirclePlusIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>Created</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>
								Confirmations{' '}
								<span className='text-text_secondary'>
									{approvals.length} of {approvals.length}
								</span>
							</div>
						</Timeline.Item>
						{!!approvals?.length && (
							<Timeline.Item
								dot={
									<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
										<CircleCheckIcon className='text-success text-sm' />
									</span>
								}
								className='success'
							>
								<Collapse bordered={false}>
									<Collapse.Panel
										showArrow={false}
										key={1}
										header={
											<span className='text-primary font-normal text-sm leading-[15px] px-3 py-2 rounded-md bg-highlight max-sm:text-[10px]'>
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
															<CircleCheckIcon className='text-success text-sm nax-sm:text-xs' />
														</span>
													}
													className={`${i === 0 && 'mt-4'} success bg-transaparent`}
												>
													<div className='mb-3 flex items-center gap-x-4'>
														<AddressComponent
															address={address}
															network={network}
														/>
													</div>
												</Timeline.Item>
											))}
										</Timeline>
									</Collapse.Panel>
								</Collapse>
							</Timeline.Item>
						)}
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div className='text-white font-normal text-sm leading-[15px]'>
								<p>Executed</p>
							</div>
						</Timeline.Item>
					</Timeline>
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
