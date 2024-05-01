import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import returnTxUrl from '@next-common/global/gnosisService';
import { ArrowDownLeftIcon, ArrowUpRightIcon, OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import GnosisSafeService from '@next-evm/services/Gnosis';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import formatBalance from '@next-evm/utils/formatBalance';
import { useWallets } from '@privy-io/react-auth';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

interface IHistoryTransactions {
	callData: string;
	callHash: string;
	type: string;
	multisigAddress: string;
	network: NETWORK;
	receivedTransfers?: any[];
	amount_token: string;
	executedAt: Date;
	to?: string;
}
const SingleTxn = ({
	callHash,
	callData,
	type,
	multisigAddress,
	network,
	receivedTransfers,
	amount_token,
	executedAt,
	to // eslint-disable-next-line sonarjs/cognitive-complexity
}: IHistoryTransactions) => {
	const { allAssets } = useMultisigAssetsContext();

	const [txData, setTxData] = useState<TransactionData | undefined>({} as any);

	const [txInfo, setTxInfo] = useState<any>({} as any);

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [amount, setAmount] = useState(0);

	const { wallets } = useWallets();

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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
		const decodeData = async () => {
			const txUrl = returnTxUrl(network as NETWORK);
			const provider = await wallets?.[0].getEthersProvider();
			const web3Adapter = new EthersAdapter({
				ethers,
				signerOrProvider: provider
			});
			const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
			gnosisService.safeService
				.decodeData(callData)
				.then((res) => setDecodedCallData(res))
				.catch((e) => console.log(e));
		};
		decodeData();
	}, [callData, network, wallets]);

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
					const assetDetails = allAssets[multisigAddress]?.assets?.find((asset) => asset.tokenAddress === item);
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
					const isFakeToken = !allAssets[multisigAddress]?.assets?.some(
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
	}, [allAssets, decodedCallData, isFundType, isSentType, multisigAddress, network, receivedTransfers, txData]);

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
			className='flex items-center px-2 pb-2 mb-2 gap-x-3 text-white grid grid-cols-9'
			onClick={(e) => e.stopPropagation()}
		>
			{loading ? (
				<Skeleton
					active
					className='w-full'
					paragraph={{ rows: 0 }}
				/>
			) : (
				<>
					<p className='col-span-5 flex items-center gap-x-3'>
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
						<span className='w-full'>
							{isFundType ? (
								isMultiTokenTx ? (
									<div className='flex gap-x-2 items-center'>
										Received Multiple Tokens
										{tokenDetailsArray.map((item) => (
											<ParachainIcon
												size={15}
												tooltip={item.tokenSymbol}
												src={item.tokenLogo}
											/>
										))}
									</div>
								) : (
									<p className='flex items-center grid grid-cols-8'>
										<span className='col-span-1'>Received</span>
										<div className='flex items-center col-span-7 gap-x-2'>
											<ParachainIcon
												size={15}
												src={tokenDetailsArray[0]?.tokenLogo || chainProperties[network]?.logo}
											/>
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
												onlyAddress
												network={network}
												iconSize={25}
												withBadge={false}
												address={receivedTransfers?.[0]?.from}
												addressLength={5}
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
												size={15}
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
												size={15}
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
													iconSize={25}
													network={network}
													onlyAddress
													withBadge={false}
													address={txInfo?.recipient?.value || to.toString() || ''}
													addressLength={5}
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
													<ParachainIcon
														size={15}
														src={item?.logoUri || ''}
													/>{' '}
													{formatBalance(item?.value)} {item?.symbol}
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
					</p>
					<p className='text-white flex items-center gap-x-2 col-span-2 text-sm'>
						<AddressComponent
							iconSize={25}
							withBadge={false}
							network={network}
							isMultisig
							showNetworkBadge
							address={multisigAddress}
						/>
					</p>
					<p className='text-white text-sm flex items-center gap-x-2 col-span-2 capitalize'>
						{dayjs(executedAt).format('lll')}
					</p>
				</>
			)}
		</Link>
	);
};

export default SingleTxn;
