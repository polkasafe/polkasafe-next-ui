// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined } from '@ant-design/icons';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ArrowDownLeftIcon, ArrowUpRightIcon, OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { getTransactionDetails, TransactionData } from '@safe-global/safe-gateway-typescript-sdk';
import { StaticImageData } from 'next/image';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import formatBalance from '@next-evm/utils/formatBalance';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

interface IHistoryTransactions {
	callData: string;
	callHash: string;
	type: string;
	receivedTransfers?: any[];
	amount_token: string;
	to?: string;
	network: NETWORK;
	gnosisSafe: GnosisSafeService;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const HistoryTransaction = ({
	callHash,
	callData,
	type,
	receivedTransfers,
	amount_token,
	network,
	gnosisSafe,
	to // eslint-disable-next-line sonarjs/cognitive-complexity
}: IHistoryTransactions) => {
	const { allAssets } = useMultisigAssetsContext();
	const { activeMultisig } = useGlobalUserDetailsContext();

	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);

	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [amount, setAmount] = useState(0);

	const [tokenDetailsArray, setTokenDetailsArray] = useState<
		{
			tokenSymbol: string;
			tokenDecimals: number;
			tokenLogo: StaticImageData | string;
			tokenAddress: string;
			isFakeToken?: boolean;
		}[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const isSentType = type === 'Sent' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend';
	const isFundType = type === 'ETHEREUM_TRANSACTION';

	const [loading, setLoading] = useState(false);

	const [isRejectionTxn, setIsRejectionTxn] = useState<boolean>(false);

	const [isCustomTxn, setIsCustomTxn] = useState<boolean>(false);

	const getTxDetails = useCallback(async () => {
		try {
			setLoading(true);
			const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), callHash);
			setTxData(txDetails.txData);
			setTxInfo(txDetails.txInfo);
			if (
				txDetails?.txInfo?.type === 'Custom' &&
				txDetails?.txInfo?.richDecodedInfo &&
				txDetails?.txInfo?.richDecodedInfo?.fragments
			) {
				setIsCustomTxn(true);
			}

			if (txDetails?.txInfo?.type === 'Custom' && txDetails?.txInfo?.isCancellation) {
				setIsRejectionTxn(true);
			}
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
					const assetDetails = allAssets[activeMultisig]?.assets?.find((asset) => asset.tokenAddress === item);
					tokenDetails.push({
						tokenAddress: assetDetails?.tokenAddress || '',
						tokenDecimals: assetDetails?.token_decimals || chainProperties[network].decimals,
						tokenLogo: assetDetails?.logoURI || chainProperties[network]?.logo,
						tokenSymbol: assetDetails?.name || chainProperties[network].tokenSymbol
					});
				} else {
					tokenDetails.push({
						tokenAddress: '',
						tokenDecimals: chainProperties[network].decimals,
						tokenLogo: chainProperties[network]?.logo,
						tokenSymbol: chainProperties[network].tokenSymbol
					});
				}
			});
			setTokenDetailsArray(tokenDetails);
		} else if (receivedTransfers.length > 0 && isFundType) {
			const tokenDetails = [];
			receivedTransfers.forEach((item) => {
				if (item?.tokenInfo) {
					const isFakeToken = !allAssets[activeMultisig]?.assets?.some(
						(asset) => asset.tokenAddress === item?.tokenInfo?.address
					);
					tokenDetails.push({
						isFakeToken,
						tokenAddress: item?.tokenInfo?.address || '',
						tokenDecimals: item?.tokenInfo?.decimals || chainProperties[network].decimals,
						tokenLogo: item?.tokenInfo?.logoUri || chainProperties[network]?.logo,
						tokenSymbol: item?.tokenInfo?.symbol || chainProperties[network].tokenSymbol
					});
				} else {
					tokenDetails.push({
						tokenAddress: '',
						tokenDecimals: chainProperties[network].decimals,
						tokenLogo: chainProperties[network]?.logo,
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
					tokenLogo: chainProperties[network]?.logo,
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
	}, [activeMultisig, allAssets, decodedCallData, isFundType, isSentType, network, receivedTransfers, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

	return tokenDetailsArray?.[0]?.isFakeToken && isFundType ? null : (
		<Link
			href={`/transactions?tab=History#${callHash || ''}`}
			className='flex items-center pb-2 mb-2 gap-x-3 text-white'
			onClick={(e) => e.stopPropagation()}
		>
			{type === 'Sent' || type === 'removeOwner' || type === 'MULTISIG_TRANSACTION' || type === 'multiSend' ? (
				<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'>
					{isRejectionTxn ? (
						<span className='flex items-center justify-center p-1 border border-failure rounded-full w-[15px] h-[15px]'>
							<OutlineCloseIcon className='w-[6px] h-[6px]' />
						</span>
					) : (
						<ArrowUpRightIcon />
					)}
				</span>
			) : (
				<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'>
					<ArrowDownLeftIcon />
				</span>
			)}
			<span className='flex-1'>
				{loading ? (
					<Skeleton
						paragraph={{ rows: 0, width: 150 }}
						active
					/>
				) : isFundType ? (
					isMultiTokenTx ? (
						<div className='flex gap-x-2 items-center'>
							Received Multiple Tokens
							{tokenDetailsArray.map((item) => (
								<ParachainIcon
									tooltip={item.tokenSymbol}
									src={item.tokenLogo}
								/>
							))}
						</div>
					) : (
						<p className='flex items-center grid grid-cols-8'>
							<span className='col-span-1'>Received</span>
							<div className='flex items-center col-span-7 gap-x-2'>
								<ParachainIcon src={tokenDetailsArray[0]?.tokenLogo || chainProperties[network]?.logo} />
								<span className='font-normal text-xs leading-[13px] text-success'>
									{formatBalance(
										ethers?.utils?.formatUnits(
											BigInt(!Number.isNaN(amount) ? amount : 0)?.toString() || amount_token?.toString(),
											tokenDetailsArray[0]?.tokenDecimals || chainProperties[network].decimals
										)
									)}{' '}
									{tokenDetailsArray[0]?.tokenSymbol || chainProperties[network].tokenSymbol}
								</span>
								from{' '}
								<AddressComponent
									network={network}
									onlyAddress
									addressLength={6}
									iconSize={25}
									withBadge={false}
									address={receivedTransfers?.[0]?.from}
								/>
							</div>
						</p>
					)
				) : isSentType ? (
					isMultiTokenTx ? (
						<div className='flex gap-x-2 items-center'>
							Sent Multiple Tokens
							{tokenDetailsArray.map((item) => (
								<ParachainIcon
									tooltip={item.tokenSymbol}
									src={item.tokenLogo}
								/>
							))}
						</div>
					) : isRejectionTxn ? (
						'On-chain Rejection'
					) : (
						<p className='grid grid-cols-8 flex items-center'>
							<span className='col-span-1'>Sent</span>
							<div className='flex items-center col-span-7 gap-x-2'>
								<ParachainIcon
									src={
										decodedCallData?.method === 'multiSend'
											? tokenDetailsArray[0]?.tokenLogo
											: txInfo?.transferInfo?.logoUri || chainProperties[network]?.logo
									}
								/>
								<span className='font-normal text-xs leading-[13px] text-failure'>
									{'-'}{' '}
									{formatBalance(
										ethers?.utils?.formatUnits(
											decodedCallData?.method === 'multiSend'
												? BigInt(!Number.isNaN(amount) ? amount : 0)?.toString()
												: txInfo?.transferInfo?.value || amount_token?.toString(),
											decodedCallData?.method === 'multiSend'
												? tokenDetailsArray[0]?.tokenDecimals
												: txInfo?.transferInfo?.decimals || chainProperties[network].decimals
										)
									)}{' '}
									{decodedCallData?.method === 'multiSend'
										? tokenDetailsArray[0]?.tokenSymbol
										: txInfo?.transferInfo?.tokenSymbol || chainProperties[network].tokenSymbol}
								</span>
								To{' '}
								{decodedCallData?.method === 'multiSend' ? (
									'Multiple Addresses'
								) : (
									<AddressComponent
										network={network}
										iconSize={25}
										addressLength={6}
										onlyAddress
										withBadge={false}
										address={txInfo?.recipient?.value || to.toString() || ''}
									/>
								)}
							</div>
						</p>
					)
				) : isCustomTxn ? (
					<p className='flex items-center gap-x-2'>
						{txInfo?.richDecodedInfo?.fragments?.map((item: any) => (
							<span className='flex items-center gap-x-2'>
								{item.type === 'text' ? (
									item.value
								) : item.type === 'tokenValue' ? (
									<>
										<ParachainIcon src={item?.logoUri || ''} /> {formatBalance(item?.value)} {item?.symbol}
									</>
								) : null}
							</span>
						))}
					</p>
				) : type === 'removeOwner' ? (
					'Removed Owner'
				) : type === 'addOwnerWithThreshold' ? (
					'Added Owner'
				) : (
					type
				)}
			</span>

			<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
				<ArrowRightOutlined />
			</div>
		</Link>
	);
};

export default HistoryTransaction;
