// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useCallback, useEffect, useState } from 'react';
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
import { TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { StaticImageData } from 'next/image';
import formatBalance from '@next-evm/utils/formatBalance';
import SentInfo from './SentInfo';
import ReceivedInfo from './ReceivedInfo';

dayjs.extend(LocalizedFormat);

const Transaction: FC<IHistoryTransactions> = ({
	approvals,
	amount_token,
	created_at,
	to,
	txHash,
	type,
	executor,
	decodedData,
	data: callData,
	advancedDetails,
	receivedTransfers
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { network } = useGlobalApiContext();
	const { gnosisSafe } = useGlobalUserDetailsContext();
	const { allAssets } = useMultisigAssetsContext();
	const token = chainProperties[network].tokenSymbol;
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	// const hash = location.hash.slice(1);
	const isSentType = type === 'Sent' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend';
	const isFundType = type === 'ETHEREUM_TRANSACTION';

	const [transactionDetails, setTransactionDetails] = useState<ITransaction>({} as any);

	const [totalAmount, setTotalAmount] = useState<number>(0);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);
	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [tokenDetailsArray, setTokenDetailsArray] = useState<
		{ tokenSymbol: string; tokenDecimals: number; tokenLogo: StaticImageData | string; tokenAddress: string }[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const urlHash = typeof window !== 'undefined' && window.location.hash.slice(1);

	useEffect(() => {
		if (!callData) return;
		gnosisSafe.safeService
			.decodeData(callData)
			.then((res) => setDecodedCallData(res))
			.catch((e) => console.log(e));
	}, [callData, gnosisSafe.safeService]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		if (
			decodedCallData &&
			decodedCallData?.method === 'multiSend' &&
			txData &&
			txData.addressInfoIndex &&
			Object.keys(txData.addressInfoIndex)?.length > 0 &&
			isSentType
		) {
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
		} else if (receivedTransfers.length > 0 && isFundType) {
			const tokenDetails = [];
			receivedTransfers.forEach((item) => {
				if (item?.tokenInfo) {
					tokenDetails.push({
						tokenAddress: item?.tokenInfo?.address || '',
						tokenDecimals: item?.tokenInfo?.decimals || chainProperties[network].decimals,
						tokenLogo: item?.tokenInfo?.logoUri || chainProperties[network].logo,
						tokenSymbol: item?.tokenInfo?.symbol || chainProperties[network].tokenSymbol
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

		const amountsArray =
			isSentType && decodedCallData && decodedCallData?.method === 'multiSend'
				? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item?.dataDecoded?.parameters?.[1]?.value)
				: receivedTransfers.map((item) => item.value);
		const total = amountsArray?.reduce((sum: number, a: string) => {
			return sum + Number(a);
		}, 0);
		setTotalAmount(total);
	}, [allAssets, decodedCallData, isFundType, isSentType, network, receivedTransfers, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

	const getTxDetails = useCallback(async () => {
		const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), txHash);

		setTxData(txDetails.txData);
		setTxInfo(txDetails.txInfo);
	}, [txHash, network]);
	useEffect(() => {
		getTxDetails();
	}, [getTxDetails]);

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
					setTransactionDetails(getTransactionData || ({} as any));
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
			defaultActiveKey={[`${urlHash}`]}
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
							{type === 'Sent' || type === 'removeOwner' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend' ? (
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
						{isSentType ? (
							isMultiTokenTx ? (
								<div className='flex gap-x-2 col-span-2'>
									{tokenDetailsArray.map((item) => (
										<ParachainIcon
											tooltip={item.tokenSymbol}
											src={item.tokenLogo}
										/>
									))}
								</div>
							) : (
								<p className='col-span-2 flex items-center gap-x-[6px]'>
									<ParachainIcon
										src={
											decodedCallData?.method === 'multiSend'
												? tokenDetailsArray[0]?.tokenLogo
												: txInfo?.transferInfo?.logoUri || chainProperties[network].logo
										}
									/>
									<span className='font-normal text-xs leading-[13px] text-failure'>
										{'-'}{' '}
										{formatBalance(
											ethers?.utils?.formatUnits(
												decodedCallData?.method === 'multiSend'
													? totalAmount?.toString()
													: txInfo?.transferInfo?.value || amount_token?.toString(),
												decodedCallData?.method === 'multiSend'
													? tokenDetailsArray[0]?.tokenDecimals
													: txInfo?.transferInfo?.decimals || chainProperties[network].decimals
											)
										)}{' '}
										{decodedCallData?.method === 'multiSend'
											? tokenDetailsArray[0]?.tokenSymbol
											: txInfo?.transferInfo?.tokenSymbol || token}
									</span>
								</p>
							)
						) : isFundType ? (
							isMultiTokenTx ? (
								<div className='flex gap-x-2 col-span-2'>
									{tokenDetailsArray.map((item) => (
										<ParachainIcon
											tooltip={item.tokenSymbol}
											src={item.tokenLogo}
										/>
									))}
								</div>
							) : (
								<p className='col-span-2 flex items-center gap-x-[6px]'>
									<ParachainIcon src={tokenDetailsArray[0]?.tokenLogo || chainProperties[network].logo} />
									<span className='font-normal text-xs leading-[13px] text-success'>
										{'+'}{' '}
										{ethers?.utils
											?.formatUnits(
												totalAmount?.toString() || amount_token?.toString(),
												tokenDetailsArray[0]?.tokenDecimals || chainProperties[network].decimals
											)
											?.toString()}{' '}
										{tokenDetailsArray[0]?.tokenSymbol || token}
									</span>
								</p>
							)
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
							transfers={receivedTransfers}
							date={dayjs(created_at).format('lll')}
							callHash={txHash || ''}
							note={transactionDetails?.note || ''}
							loading={loading}
							tokenDetialsArray={tokenDetailsArray}
						/>
					) : (
						<SentInfo
							amount={
								decodedCallData.method === 'multiSend'
									? decodedCallData?.parameters?.[0]?.valueDecoded?.map(
											(item: any) => item?.dataDecoded?.parameters?.[1]?.value
									  )
									: txInfo?.transferInfo?.value || String(amount_token)
							}
							approvals={approvals}
							date={dayjs(created_at).format('lll')}
							recipientAddress={
								decodedCallData.method === 'multiSend'
									? decodedCallData?.parameters?.[0]?.valueDecoded?.map(
											(item: any) => item?.dataDecoded?.parameters?.[0]?.value
									  )
									: txInfo?.recipient?.value || to.toString() || ''
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
							multiSendTokens={tokenDetailsArray}
							tokenSymbol={txInfo?.transferInfo?.tokenSymbol}
							tokenDecimals={txInfo?.transferInfo?.decimals}
							advancedDetails={advancedDetails}
						/>
					)}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
