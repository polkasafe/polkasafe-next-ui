// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ITransaction, ITxnCategory } from '@next-common/types';
import {
	ArrowDownLeftIcon,
	ArrowUpRightIcon,
	CircleArrowDownIcon,
	CircleArrowUpIcon,
	OutlineCloseIcon
} from '@next-common/ui-components/CustomIcons';
import { IHistoryTransactions } from '@next-evm/utils/convertSafeData/convertSafeHistory';

import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { TransactionData, getTransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { StaticImageData } from 'next/image';
import formatBalance from '@next-evm/utils/formatBalance';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import returnTxUrl from '@next-common/global/gnosisService';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useWallets } from '@privy-io/react-auth';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';
import TransactionFields, { generateCategoryKey } from '../TransactionFields';

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
	receivedTransfers,
	safeAddress
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { isSharedSafe, sharedSafeNetwork, activeMultisig, sharedSafeAddress } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { allAssets } = useMultisigAssetsContext();

	const shared = sharedSafeAddress === activeMultisig;
	const multisig = activeOrg?.multisigs?.find((item) => item.address === safeAddress);
	const [network, setNetwork] = useState<NETWORK>(NETWORK.ETHEREUM);

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
		{
			tokenSymbol: string;
			tokenDecimals: number;
			tokenLogo: StaticImageData | string;
			tokenAddress: string;
			isFakeToken?: boolean;
		}[]
	>([]);
	const [isMultiTokenTx, setIsMultiTokenTx] = useState<boolean>(false);

	const [isRejectionTxn, setIsRejectionTxn] = useState<boolean>(false);

	const [isCustomTxn, setIsCustomTxn] = useState<boolean>(false);
	const [isContractInteraction, setIsContractInteraction] = useState<boolean>(false);

	const urlHash = typeof window !== 'undefined' && window.location.hash.slice(1);

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [category, setCategory] = useState<string>('none');

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<ITxnCategory>({
		category: 'none',
		subfields: {}
	});

	useEffect(() => {
		if (!multisig?.network) return;
		const n =
			isSharedSafe && sharedSafeNetwork && Object.values(NETWORK).includes(sharedSafeNetwork) && shared
				? sharedSafeNetwork
				: multisig?.network || NETWORK.ETHEREUM;
		setNetwork(n as NETWORK);
	}, [isSharedSafe, multisig?.network, shared, sharedSafeNetwork]);

	useEffect(() => {
		if (!callData) return;
		const decodeData = async () => {
			const txUrl = returnTxUrl(network as NETWORK);
			const provider = await connectedWallet.getEthersProvider();
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
	}, [callData, connectedWallet, network]);

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
					const assetDetails = allAssets[safeAddress]?.assets?.find((asset) => asset.tokenAddress === item);
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
					const isFakeToken = !allAssets[safeAddress]?.assets?.some(
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
		setTotalAmount(total);
	}, [allAssets, decodedCallData, isFundType, isSentType, network, receivedTransfers, safeAddress, txData]);

	useEffect(() => {
		if (tokenDetailsArray.length > 1) {
			const tokenSymbols = tokenDetailsArray.map((item) => item.tokenSymbol);
			const uniqueTokens = [...new Set(tokenSymbols)];
			if (uniqueTokens.length > 1) setIsMultiTokenTx(true);
		}
	}, [tokenDetailsArray]);

	const getTxDetails = useCallback(async () => {
		const txDetails = await getTransactionDetails(chainProperties[network].chainId.toString(), txHash);

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

		if (txDetails?.txInfo?.type === 'Custom' && !(txDetails?.txInfo as any)?.transferInfo) {
			setIsContractInteraction(true);
		}

		setTxData(txDetails.txData);
		setTxInfo(txDetails.txInfo);

		const getTransactionRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getTransactionDetailsEth`, {
			body: JSON.stringify({
				callHash: txHash
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: getTransactionData, error: getTransactionErr } = (await getTransactionRes.json()) as {
			data: ITransaction;
			error: string;
		};

		if (getTransactionErr) {
			console.log('error', getTransactionErr);
			setLoading(false);
		} else {
			setLoading(false);
			setTransactionDetails(getTransactionData || ({} as any));
			if (getTransactionData?.transactionFields) {
				setTransactionFieldsObject(getTransactionData.transactionFields);
				setCategory(
					getTransactionData?.transactionFields?.category
						? generateCategoryKey(getTransactionData.transactionFields.category)
						: 'none'
				);
			}
		}
	}, [network, txHash, connectedWallet]);
	useEffect(() => {
		getTxDetails();
	}, [getTxDetails]);

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left mb-[10px]'
			bordered={false}
			defaultActiveKey={[`${urlHash}`]}
		>
			<Collapse.Panel
				showArrow={false}
				key={`${txHash}`}
				header={
					<div
						onClick={() => {
							toggleTransactionVisible(!transactionInfoVisible);
						}}
						className={classNames(
							'grid items-center grid-cols-[repeat(13,_minmax(0,_1fr))] cursor-pointer text-white font-normal text-sm leading-[15px]'
						)}
					>
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
											Multiple Tokens
											{tokenDetailsArray.map((item) => (
												<ParachainIcon
													tooltip={item.tokenSymbol}
													src={item.tokenLogo}
												/>
											))}
										</div>
									) : (
										<p className='flex items-center grid grid-cols-8'>
											<div className='flex items-center col-span-7 gap-x-2'>
												<ParachainIcon src={tokenDetailsArray[0]?.tokenLogo || chainProperties[network]?.logo} />
												<span className='font-normal text-xs leading-[13px] text-success'>
													{formatBalance(
														ethers?.utils?.formatUnits(
															BigInt(!Number.isNaN(totalAmount) ? totalAmount : 0)?.toString() ||
																amount_token?.toString(),
															tokenDetailsArray[0]?.tokenDecimals || chainProperties[network].decimals
														)
													)}{' '}
													{tokenDetailsArray[0]?.tokenSymbol || token}
												</span>
												from{' '}
												<AddressComponent
													network={network}
													onlyAddress
													addressLength={5}
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
											Multiple Tokens
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
																? BigInt(!Number.isNaN(totalAmount) ? totalAmount : 0)?.toString()
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
												To{' '}
												{decodedCallData?.method === 'multiSend' ? (
													'Multiple Addresses'
												) : (
													<AddressComponent
														network={network}
														iconSize={25}
														addressLength={5}
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
								) : isContractInteraction ? (
									'Contract Interaction'
								) : (
									type
								)}
							</span>
						</p>
						<p className='col-span-3'>
							<AddressComponent
								address={safeAddress}
								withBadge={false}
								isMultisig
								showNetworkBadge
								network={multisig?.network as NETWORK}
							/>
						</p>
						{created_at && <p className='col-span-2'>{dayjs(created_at).format('DD/MM/YYYY[,] HH:mm')}</p>}
						<p className='col-span-2 pr-1'>
							<TransactionFields
								callHash={txHash}
								category={category}
								setCategory={setCategory}
								transactionFieldsObject={transactionFieldsObject}
								setTransactionFieldsObject={setTransactionFieldsObject}
								multisigAddress={multisig.address}
								network={network}
							/>
						</p>
						<p className='col-span-1 flex items-center justify-end gap-x-4'>
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
							network={multisig?.network as NETWORK}
							transactionFields={transactionFieldsObject}
							category={category}
							setCategory={setCategory}
							setTransactionFields={setTransactionFieldsObject}
							multisigAddress={multisig?.address || ''}
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
							date={created_at}
							recipientAddress={
								decodedCallData.method === 'multiSend'
									? decodedCallData?.parameters?.[0]?.valueDecoded?.map(
											(item: any) => item?.dataDecoded?.parameters?.[0]?.value
									  )
									: txInfo?.recipient?.value || to.toString() || ''
							}
							callHash={txHash || ''}
							note={transactionDetails?.note || ''}
							transactionFields={transactionFieldsObject}
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
							tokenAddress={txInfo?.transferInfo?.tokenAddress}
							advancedDetails={advancedDetails}
							isCustomTxn={isCustomTxn}
							isRejectionTxn={isRejectionTxn}
							network={multisig?.network as NETWORK}
							isContractInteraction={isContractInteraction}
							category={category}
							setCategory={setCategory}
							setTransactionFields={setTransactionFieldsObject}
							multisigAddress={multisig?.address || ''}
						/>
					)}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
