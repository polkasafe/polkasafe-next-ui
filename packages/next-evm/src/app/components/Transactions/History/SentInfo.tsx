// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Divider, Spin, Timeline } from 'antd';
import classNames from 'classnames';
// import { ethers } from 'ethers';
import React, { FC, useEffect, useState } from 'react';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import {
	ArrowRightIcon,
	CircleCheckIcon,
	CirclePlusIcon,
	CircleWatchIcon,
	CopyIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { ethers } from 'ethers';
import { StaticImageData } from 'next/image';
import getHistoricalTokenPrice from '@next-evm/utils/getHistoricalTokenPrice';
import dayjs from 'dayjs';
import FiatCurrencyValue from '@next-evm/ui-components/FiatCurrencyValue';
import tokenToUSDConversion from '@next-evm/utils/tokenToUSDConversion';
import getHistoricalNativeTokenPrice from '@next-evm/utils/getHistoricalNativeTokenPrice';
import { ITxnCategory } from '@next-common/types';
import TransactionFields from '../TransactionFields';

interface ISentInfoProps {
	amount: string | string[];
	approvals: string[];
	addressAddOrRemove?: string;
	date: Date;
	// time: string;
	className?: string;
	recipientAddress: string | string[];
	callHash: string;
	note?: string;
	loading?: boolean;
	from: string;
	txType?: string;
	transactionFields?: ITxnCategory;
	tokenSymbol?: string;
	tokenDecimals?: number;
	tokenAddress?: string;
	advancedDetails: any;
	multiSendTokens?: {
		tokenSymbol: string;
		tokenDecimals: number;
		tokenLogo: StaticImageData | string;
		tokenAddress: string;
	}[];
	isRejectionTxn?: boolean;
	isCustomTxn?: boolean;
	isContractInteraction?: boolean;
	network: NETWORK;
	multisigAddress: string;
	category: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	setTransactionFields: React.Dispatch<React.SetStateAction<ITxnCategory>>;
}

const SentInfo: FC<ISentInfoProps> = ({
	advancedDetails,
	approvals,
	amount,
	from,
	className,
	date,
	recipientAddress,
	callHash,
	note,
	loading,
	txType,
	addressAddOrRemove,
	transactionFields,
	tokenDecimals,
	tokenSymbol,
	multiSendTokens,
	isRejectionTxn,
	isCustomTxn,
	tokenAddress,
	network,
	isContractInteraction,
	category,
	setCategory,
	setTransactionFields,
	multisigAddress
}) => {
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const threshold = approvals?.length || 0;

	const [usdValue, setUsdValue] = useState<string | string[]>('0');
	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (tokenAddress) {
			getHistoricalTokenPrice(network, tokenAddress, date).then((usd) => {
				setUsdValue(Number(usd).toFixed(4));
			});
		} else if (amount && !Array.isArray(amount)) {
			getHistoricalNativeTokenPrice(network, date).then((usd) => {
				setUsdValue(Number(usd).toFixed(4));
			});
		} else if (multiSendTokens && multiSendTokens.length > 0) {
			multiSendTokens.forEach((token) => {
				if (!token.tokenAddress) {
					getHistoricalNativeTokenPrice(network, date).then((usd) => {
						setUsdValue((prev) => [...prev, Number(usd).toFixed(4)]);
					});
					return;
				}
				getHistoricalTokenPrice(network, token.tokenAddress, date).then((usd) => {
					setUsdValue((prev) => [...prev, Number(usd).toFixed(4)]);
				});
			});
		}
	}, [amount, date, multiSendTokens, network, tokenAddress]);

	return (
		<div className={classNames('flex gap-x-4', className)}>
			<article className='p-4 rounded-lg bg-bg-main flex-1'>
				{!(txType === 'addOwnerWithThreshold' || txType === 'removeOwner') &&
					recipientAddress &&
					!isRejectionTxn &&
					!isCustomTxn &&
					!isContractInteraction &&
					amount &&
					(typeof recipientAddress === 'string' ? (
						<>
							<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
								<span>Sent</span>
								<span className='text-failure'>
									{amount
										? ethers.utils.formatUnits(String(amount), tokenDecimals || chainProperties[network].decimals)
										: '?'}{' '}
									{tokenSymbol || chainProperties[network].tokenSymbol}{' '}
									{amount &&
										!Number.isNaN(amount) &&
										!Array.isArray(amount) &&
										!Array.isArray(usdValue) &&
										Number(usdValue) !== 0 && (
											<>
												(
												<FiatCurrencyValue
													value={tokenToUSDConversion(
														ethers.utils.formatUnits(
															BigInt(!Number.isNaN(amount) ? amount : 0).toString(),
															tokenDecimals || chainProperties[network].decimals
														),
														usdValue
													)}
												/>
												)
											</>
										)}
								</span>
								<span>To:</span>
							</p>
							<div className='mt-3'>
								<AddressComponent
									network={network}
									address={recipientAddress}
								/>
							</div>
						</>
					) : (
						<div className='flex flex-col gap-y-1 max-h-[200px] overflow-y-auto'>
							{Array.isArray(recipientAddress) &&
								recipientAddress.map((item, i) => (
									<>
										<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
											<span>Sent</span>
											<span className='text-failure'>
												{amount[i]
													? ethers.utils.formatUnits(
															String(amount[i]),
															multiSendTokens?.[i]?.tokenDecimals || tokenDecimals || chainProperties[network].decimals
													  )
													: '?'}{' '}
												{multiSendTokens?.[i]?.tokenSymbol || tokenSymbol || chainProperties[network].tokenSymbol}{' '}
												{amount[i] &&
													!Number.isNaN(amount[i]) &&
													!Array.isArray(amount[i]) &&
													Number(usdValue[i]) !== 0 && (
														<>
															(
															<FiatCurrencyValue
																value={tokenToUSDConversion(
																	ethers.utils.formatUnits(
																		BigInt(!Number.isNaN(amount[i]) ? amount[i] : 0).toString(),
																		tokenDecimals || chainProperties[network].decimals
																	),
																	usdValue[i]
																)}
															/>
															)
														</>
													)}
											</span>
											<span>To:</span>
										</p>
										<div className='mt-3'>
											<AddressComponent
												network={network}
												address={item}
											/>
										</div>
										{recipientAddress.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
									</>
								))}
						</div>
					))}
				{isRejectionTxn && (
					<div>
						<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>
								This is an on-chain rejection that won&apos;t send any funds. Executing this on-chain rejection will
								replace all currently awaiting transactions with nonce {advancedDetails?.nonce || '0'}.
							</p>
						</section>
					</div>
				)}
				{isContractInteraction && recipientAddress && typeof recipientAddress === 'string' && (
					<div className='mt-3 flex flex-col gap-y-2 text-white font-medium text-sm'>
						<span>Interact with: </span>
						<AddressComponent
							network={network}
							address={recipientAddress}
						/>
					</div>
				)}
				<Divider className='bg-text_secondary my-5' />
				<div className='flex items-center justify-between mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Executed By:</span>
					<AddressComponent
						network={network}
						address={from}
					/>
				</div>
				<div className='flex items-center justify-between mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Txn Hash:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callHash, 10)}</span>
						<span className='flex items-center gap-x-2 text-sm'>
							<button onClick={() => copyText(callHash)}>
								<CopyIcon />
							</button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
				</div>
				<div className='flex items-center justify-between mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Executed:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{dayjs(date).format('lll')}</span>
					</p>
				</div>
				{addressAddOrRemove && (
					<div className='flex items-center justify-between mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>
							{txType === 'addOwnerWithThreshold' ? 'Added Owner' : 'Removed Owner'}:
						</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<AddressComponent
								network={network}
								address={addressAddOrRemove}
							/>
						</p>
					</div>
				)}
				{loading ? (
					<Spin className='mt-3' />
				) : (
					<>
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
					</>
				)}

				<p
					onClick={() => setShowDetails((prev) => !prev)}
					className='text-primary cursor-pointer font-medium text-sm leading-[15px] mt-5 flex items-center gap-x-3'
				>
					<span>{showDetails ? 'Hide' : 'Advanced'} Details</span>
					<ArrowRightIcon />
				</p>
				{showDetails &&
					advancedDetails &&
					typeof advancedDetails === 'object' &&
					Object.keys(advancedDetails).map((adv) => (
						<div
							key={adv}
							className='flex items-center gap-x-5 mt-3 justify-between'
						>
							<span className='text-text_secondary font-normal text-sm leading-[15px]'>{adv}:</span>
							<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
								<span className='text-white font-normal text-sm leading-[15px]'>
									{String(advancedDetails[adv]).startsWith('0x')
										? shortenAddress(advancedDetails[adv], 10)
										: advancedDetails[adv]}
								</span>
								{String(advancedDetails[adv]).startsWith('0x') ? (
									<span className='flex items-center gap-x-2 text-sm'>
										<button onClick={() => copyText(callHash)}>
											<CopyIcon className='hover:text-primary' />
										</button>
										{/* <ExternalLinkIcon /> */}
									</span>
								) : null}
							</p>
						</div>
					))}
			</article>
			<article className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'>
				<div className='h-full'>
					<Timeline className='flex flex-col'>
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
									{threshold} of {threshold}
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
											<span className='text-primary font-normal text-sm leading-[15px] px-3 py-2 rounded-md bg-highlight'>
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
													<div className='mb-3 flex items-center gap-x-4'>
														<AddressComponent
															network={network}
															address={address}
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

export default SentInfo;
