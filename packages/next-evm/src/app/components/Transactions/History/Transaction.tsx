// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useEffect, useState } from 'react';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ITransaction } from '@next-common/types';
import {
	ArrowDownLeftIcon,
	ArrowUpRightIcon,
	CircleArrowDownIcon,
	CircleArrowUpIcon
} from '@next-common/ui-components/CustomIcons';
import { IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';

import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';
import SentInfo from './SentInfo';
import ReceivedInfo from './ReceivedInfo';

dayjs.extend(LocalizedFormat);

const Transaction: FC<IHistoryTransactions> = ({
	approvals,
	amount_token,
	created_at,
	to,
	from,
	txHash,
	type,
	executor,
	decodedData,
	data: callData
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { network } = useGlobalApiContext();
	const { gnosisSafe } = useGlobalUserDetailsContext();
	const token = chainProperties[network].tokenSymbol;
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	// const hash = location.hash.slice(1);
	const isSentType = type === 'Sent' || type === 'MULTISIG_TRANSACTION';
	const isFundType = type === 'ETHEREUM_TRANSACTION';

	const [transactionDetails, setTransactionDetails] = useState<ITransaction>({} as any);

	const [totalAmount, setTotalAmount] = useState<number>(0);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	useEffect(() => {
		if (!callData) return;
		gnosisSafe.safeService
			.decodeData(callData)
			.then((res) => setDecodedCallData(res))
			.catch((e) => console.log(e));
	}, [callData, gnosisSafe.safeService]);

	useEffect(() => {
		if (decodedCallData.method !== 'multiSend') return;

		const total = decodedCallData?.parameters?.[0]?.valueDecoded?.reduce(
			(t: number, item: any) => t + Number(item.value),
			0
		);
		setTotalAmount(total);
	}, [decodedCallData]);

	const handleGetHistoryNote = async () => {
		try {
			const userAddress = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
			} else {
				setLoading(true);
				const { data: getTransactionData, error: getTransactionErr } = await nextApiClientFetch<ITransaction>(
					`${EVM_API_URL}/getTransactionDetailsEth`,
					{ callHash: txHash },
					{ network }
				);

				if (getTransactionErr) {
					console.log('error', getTransactionErr);
					setLoading(false);
				} else {
					setLoading(false);
					setTransactionDetails(getTransactionData);
				}
			}
		} catch (error) {
			setLoading(false);
			console.log('ERROR', error);
		}
	};

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
			bordered={false}
			// defaultActiveKey={[`${hash}`]}
		>
			<Collapse.Panel
				showArrow={false}
				key={`${txHash}`}
				header={
					<div
						onClick={() => {
							if (!transactionInfoVisible) {
								handleGetHistoryNote();
							}
							toggleTransactionVisible(!transactionInfoVisible);
						}}
						className={classNames(
							'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
						)}
					>
						<p className='col-span-3 flex items-center gap-x-3'>
							{type === 'Sent' || type === 'removeOwner' || type === 'MULTISIG_TRANSACTION' ? (
								<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'>
									<ArrowUpRightIcon />
								</span>
							) : (
								<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'>
									<ArrowDownLeftIcon />
								</span>
							)}
							<span>
								{type === 'ETHEREUM_TRANSACTION'
									? 'Fund'
									: type === 'Sent' || type === 'MULTISIG_TRANSACTION'
									? 'Sent'
									: type === 'removeOwner'
									? 'Removed Owner'
									: type === 'addOwnerWithThreshold'
									? 'Added Owner'
									: type}
							</span>
						</p>
						{isFundType || isSentType ? (
							<p className='col-span-2 flex items-center gap-x-[6px]'>
								<ParachainIcon src={chainProperties[network].logo} />
								<span className={`font-normal text-xs leading-[13px] text-failure ${isFundType && 'text-success'}`}>
									{isSentType ? '-' : '+'}{' '}
									{ethers?.utils
										?.formatEther(totalAmount ? totalAmount.toString() : amount_token?.toString())
										?.toString()}{' '}
									{token}
								</span>
							</p>
						) : (
							<p className='col-span-2'>-</p>
						)}
						{created_at && <p className='col-span-2'>{new Date(created_at).toLocaleString()}</p>}
						<p className='col-span-2 flex items-center justify-end gap-x-4'>
							<span className='text-success'>Success</span>
							<span className='text-white text-sm'>
								{transactionInfoVisible ? <CircleArrowUpIcon /> : <CircleArrowDownIcon />}
							</span>
						</p>
					</div>
				}
			>
				<div>
					<Divider className='bg-text_secondary my-5' />
					{isFundType ? (
						<ReceivedInfo
							amount={String(amount_token)}
							date={dayjs(created_at).format('lll')}
							from={from}
							callHash={txHash || ''}
							note={transactionDetails?.note || ''}
							loading={loading}
							to={to}
						/>
					) : (
						<SentInfo
							amount={
								decodedCallData.method === 'multiSend'
									? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.value)
									: String(amount_token)
							}
							approvals={approvals}
							date={dayjs(created_at).format('lll')}
							recipientAddress={
								decodedCallData.method === 'multiSend'
									? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.to)
									: to.toString() || ''
							}
							callHash={txHash || ''}
							note={transactionDetails?.note || ''}
							from={executor || ''}
							loading={loading}
							txType={type}
							addressAddOrRemove={
								type === 'addOwnerWithThreshold'
									? decodedData.parameters?.[0]?.value
									: type === 'removeOwner'
									? decodedData.parameters?.[1]?.value
									: ''
							}
						/>
					)}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
