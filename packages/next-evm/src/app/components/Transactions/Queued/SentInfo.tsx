// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Collapse, Divider, Spin, Timeline } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import CancelBtn from '@next-evm/app/components/Multisig/CancelBtn';
import RemoveBtn from '@next-evm/app/components/Settings/RemoveBtn';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { chainProperties } from '@next-common/global/evm-network-constants';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import {
	ArrowRightIcon,
	CheckOutlined,
	CircleCheckIcon,
	CirclePlusIcon,
	CircleWatchIcon,
	CopyIcon,
	EditIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';

import { ethers } from 'ethers';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { StaticImageData } from 'next/image';
import EditNote from './EditNote';

interface ISentInfoProps {
	amount: string | string[];
	transactionFields?: { category: string; subfields: { [subfield: string]: { name: string; value: string } } };
	date: Date;
	// time: string;
	loading: boolean;
	addressAddOrRemove?: string;
	approvals: string[];
	threshold: number;
	className?: string;
	callHash: string;
	callData: string;
	recipientAddress?: string | string[];
	handleApproveTransaction: () => Promise<void>;
	handleCancelTransaction: () => Promise<void>;
	handleExecuteTransaction: () => Promise<void>;
	note: string;
	txType?: string;
	transactionDetailsLoading: boolean;
	tokenSymbol?: string;
	tokenDecimals?: number;
	multiSendTokens?: {
		tokenSymbol: string;
		tokenDecimals: number;
		tokenLogo: StaticImageData | string;
		tokenAddress: string;
	}[];
	advancedDetails: any;
	isRejectionTxn?: boolean;
	setOpenReplaceTxnModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SentInfo: FC<ISentInfoProps> = ({
	handleExecuteTransaction,
	amount,
	addressAddOrRemove,
	transactionFields,
	className,
	callData,
	callHash,
	recipientAddress,
	date,
	approvals,
	loading,
	threshold,
	handleApproveTransaction,
	handleCancelTransaction,
	txType,
	note,
	transactionDetailsLoading,
	tokenSymbol,
	tokenDecimals,
	multiSendTokens,
	advancedDetails,
	isRejectionTxn,
	setOpenReplaceTxnModal
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { network } = useGlobalApiContext();

	const { address: userAddress, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
	const [updatedNote, setUpdatedNote] = useState(note);
	const [openEditNoteModal, setOpenEditNoteModal] = useState<boolean>(false);

	useEffect(() => {
		setUpdatedNote(note);
	}, [note]);

	const depositor = approvals[0];

	const activeMultisigObject = multisigAddresses?.find((item: any) => item.address === activeMultisig);

	return (
		<div className={classNames('flex gap-x-4', className)}>
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
			<article className='p-4 rounded-lg bg-bg-main flex-1'>
				{!(txType === 'addOwnerWithThreshold' || txType === 'removeOwner') &&
					!isRejectionTxn &&
					recipientAddress &&
					amount &&
					(typeof recipientAddress === 'string' ? (
						<>
							<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
								<span>Send</span>
								<span className='text-failure'>
									{amount
										? ethers.utils.formatUnits(String(amount), tokenDecimals || chainProperties[network].decimals)
										: '?'}{' '}
									{tokenSymbol || chainProperties[network].tokenSymbol}{' '}
								</span>
								<span>To:</span>
							</p>
							<div className='mt-3'>
								<AddressComponent address={recipientAddress} />
							</div>
						</>
					) : (
						<div className='flex flex-col gap-y-1 max-h-[200px] overflow-y-auto'>
							{Array.isArray(recipientAddress) &&
								recipientAddress.map((item, i) => (
									<>
										<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
											<span>Send</span>
											<span className='text-failure'>
												{amount[i]
													? ethers.utils.formatUnits(
															String(amount[i]),
															multiSendTokens?.[i]?.tokenDecimals || tokenDecimals || chainProperties[network].decimals
													  )
													: '?'}{' '}
												{multiSendTokens?.[i]?.tokenSymbol || tokenSymbol || chainProperties[network].tokenSymbol}{' '}
											</span>
											<span>To:</span>
										</p>
										<div className='mt-3'>
											<AddressComponent address={item} />
										</div>
										{recipientAddress.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
									</>
								))}
						</div>
					))}
				{/* {!callData &&
					<Input size='large' placeholder='Enter Call Data.' className='w-full my-2 text-sm font-normal leading-[15px] border-0 outline-0 placeholder:text-[#505050] bg-bg-secondary rounded-md text-white' onChange={(e) => setCallDataString(e.target.value)} />
				} */}
				{!(txType === 'addOwnerWithThreshold' || txType === 'removeOwner') && !isRejectionTxn && (
					<Divider className='bg-text_secondary my-5' />
				)}
				{isRejectionTxn && (
					<div>
						<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>
								This is an on-chain rejection that won&apos;t send any funds. Executing this on-chain rejection will
								replace all currently awaiting transactions with nonce {advancedDetails?.nonce || '0'}.
							</p>
						</section>
						<Divider className='bg-text_secondary my-5' />
					</div>
				)}
				<div className='flex items-center gap-x-5 mt-3 justify-between'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Created at:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{dayjs(date).format('llll')}</span>
					</p>
				</div>
				{addressAddOrRemove && (
					<div className='flex items-center gap-x-5 mt-3 justify-between'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>
							{txType === 'addOwnerWithThreshold' ? 'Adding Owner' : 'Removing Owner'}:
						</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<AddressComponent address={addressAddOrRemove} />
						</p>
					</div>
				)}
				<div className='flex items-center gap-x-5 mt-3 justify-between'>
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
					<div className='flex items-center gap-x-5 mt-3 justify-between'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Call Data:</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callData, 10)}</span>
							<span className='flex items-center gap-x-2 text-sm'>
								<button onClick={() => copyText(callData)}>
									<CopyIcon className='hover:text-primary' />
								</button>
							</span>
						</p>
					</div>
				)}
				{transactionDetailsLoading ? (
					<Spin className='mt-3' />
				) : (
					<>
						<div className='flex items-center gap-x-5 justify-between mt-3'>
							<span className='text-text_secondary font-normal text-sm leading-[15px]'>Note:</span>
							<span className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
								{updatedNote ? (
									<span className='text-white font-normal flex items-center flex-wrap gap-x-3'>
										<p className='whitespace-pre'>{updatedNote}</p>
										{!!depositor && depositor === userAddress && (
											<button onClick={() => setOpenEditNoteModal(true)}>
												<EditIcon className='text-primary cursor-pointer' />
											</button>
										)}
									</span>
								) : (
									depositor === userAddress && (
										<button onClick={() => setOpenEditNoteModal(true)}>
											<EditIcon className='text-primary cursor-pointer' />
										</button>
									)
								)}
							</span>
						</div>
						{!!transactionFields &&
							Object.keys(transactionFields).length !== 0 &&
							transactionFields.category !== 'none' && (
								<>
									<div className='flex items-center justify-between mt-3'>
										<span className='text-text_secondary font-normal text-sm leading-[15px]'>Category:</span>
										<span className='text-primary border border-solid border-primary rounded-xl px-[6px] py-1'>
											{transactionFields?.category}
										</span>
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
													<span className='text-text_secondary font-normal text-sm leading-[15px]'>
														{subfield.name}:
													</span>
													<span className='text-waiting bg-waiting bg-opacity-5 border border-solid border-waiting rounded-lg px-[6px] py-[3px]'>
														{subfield.value}
													</span>
												</div>
											);
										})}
								</>
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
								Confirmations
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
													<AddressComponent address={address} />
												</div>
											</Timeline.Item>
										))}

										{activeMultisigObject?.signatories
											.filter((item: any) => !approvals.includes(item))
											.map((address: any, i: any) => {
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
															<AddressComponent address={address} />
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
						{/* {console.log(approvals)} */}
						{!approvals.includes(userAddress) ? (
							<Button
								disabled={approvals.includes(userAddress)}
								loading={loading}
								icon={<CheckOutlined className='text-white' />}
								onClick={handleApproveTransaction}
								className={`w-full border-none text-sm font-normal ${
									approvals.includes(userAddress) ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'
								}`}
							>
								Approve Transaction
							</Button>
						) : (
							threshold === approvals.length && (
								<Button
									loading={loading}
									icon={<CheckOutlined className='text-white' />}
									onClick={handleExecuteTransaction}
									className='w-full border-none text-sm font-normal bg-primary text-white'
								>
									Execute Transaction
								</Button>
							)
						)}
						<Button
							disabled={loading}
							icon={
								<span className='flex items-center justify-center p-1 border border-failure rounded-full w-[15px] h-[15px]'>
									<OutlineCloseIcon className='w-[6px] h-[6px]' />
								</span>
							}
							onClick={() => setOpenReplaceTxnModal(true)}
							className='w-full border-none text-sm font-normal bg-failure bg-opacity-10 text-failure'
						>
							Replace Transaction
						</Button>
					</div>
				</div>
			</article>
		</div>
	);
};

export default SentInfo;
