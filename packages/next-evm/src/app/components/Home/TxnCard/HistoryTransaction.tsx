// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined } from '@ant-design/icons';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@next-common/ui-components/CustomIcons';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { getTransactionDetails, TransactionData } from '@safe-global/safe-gateway-typescript-sdk';
import { StaticImageData } from 'next/image';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import formatBalance from '@next-evm/utils/formatBalance';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

interface IHistoryTransactions {
	callData: string;
	callHash: string;
	type: string;
	receivedTransfers?: any[];
	amount_token: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const HistoryTransaction = ({ callHash, callData, type, receivedTransfers, amount_token }: IHistoryTransactions) => {
	const { network } = useGlobalApiContext();
	const { allAssets } = useMultisigAssetsContext();
	const { gnosisSafe } = useGlobalUserDetailsContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [amount, setAmount] = useState(0);

	const [tokenDetailsArray, setTokenDetailsArray] = useState<
		{ tokenSymbol: string; tokenDecimals: number; tokenLogo: StaticImageData | string; tokenAddress: string }[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const isSentType = type === 'Sent' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend';
	const isFundType = type === 'ETHEREUM_TRANSACTION';

	const [loading, setLoading] = useState(false);

	const getTxDetails = useCallback(async () => {
		try {
			setLoading(true);
			const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), callHash);
			setTxData(txDetails.txData);
			setTxInfo(txDetails.txInfo);
			setLoading(false);
		} catch (err) {
			console.log(err);
			setLoading(false);
		}
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
		setAmount(total);
	}, [allAssets, decodedCallData, isFundType, isSentType, network, receivedTransfers, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

	return (
		<Link
			href={`/transactions?tab=History#${callHash || ''}`}
			className='flex items-center pb-2 mb-2'
			onClick={(e) => e.stopPropagation()}
		>
			<div className='flex flex-1 items-center'>
				{type === 'Sent' || type === 'removeOwner' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend' ? (
					<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'>
						<ArrowUpRightIcon />
					</span>
				) : (
					<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'>
						<ArrowDownLeftIcon />
					</span>
				)}
				<div className='ml-3'>
					<h1 className='text-md text-white'>
						<span>Txn: {shortenAddress(callHash)} </span>
					</h1>
					<p className='text-text_secondary text-xs'>Completed</p>
				</div>
			</div>

			<div>
				<h1 className='text-md text-white'>
					{loading ? (
						<Skeleton
							paragraph={{ rows: 0, width: 150 }}
							active
						/>
					) : isSentType ? (
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
												? amount?.toString()
												: txInfo?.transferInfo?.value || amount_token?.toString() || 0,
											decodedCallData?.method === 'multiSend'
												? tokenDetailsArray[0]?.tokenDecimals
												: txInfo?.transferInfo?.decimals || chainProperties[network].decimals
										)
									)}{' '}
									{decodedCallData?.method === 'multiSend'
										? tokenDetailsArray[0]?.tokenSymbol
										: txInfo?.transferInfo?.tokenSymbol || chainProperties[network].tokenSymbol}
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
									{formatBalance(
										ethers?.utils?.formatUnits(
											amount?.toString() || 0,
											tokenDetailsArray[0]?.tokenDecimals || chainProperties[network].decimals
										)
									)}{' '}
									{tokenDetailsArray[0]?.tokenSymbol || chainProperties[network].tokenSymbol}
								</span>
							</p>
						)
					) : (
						<p className='col-span-2'>-</p>
					)}
				</h1>
			</div>

			<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
				<ArrowRightOutlined />
			</div>
		</Link>
	);
};

export default HistoryTransaction;
