// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { bnToBn } from '@polkadot/util';
import { Collapse, Divider, message, Skeleton } from 'antd';
import BN from 'bn.js';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { IMultisigAddress, IQueueItem, ITxnCategory, ITxNotification } from '@next-common/types';
import { ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from '@next-common/ui-components/CustomIcons';
import LoadingModal from '@next-common/ui-components/LoadingModal';
import approveAddProxy from '@next-substrate/utils/approveAddProxy';
import approveMultisigTransfer from '@next-substrate/utils/approveMultisigTransfer';
import approveProxy from '@next-substrate/utils/approveProxy';
import cancelMultisigTransfer from '@next-substrate/utils/cancelMultisigTransfer';
import cancelProxy from '@next-substrate/utils/cancelProxy';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import parseDecodedValue from '@next-substrate/utils/parseDecodedValue';
import setSigner from '@next-substrate/utils/setSigner';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

import SentInfo from './SentInfo';
import TransactionFields, { generateCategoryKey } from '../TransactionFields';

interface ITransactionProps {
	approvalsArray?: string[];
	totalAmount?: string;
	transactionFields?: ITxnCategory;
	// eslint-disable-next-line react/no-unused-prop-types
	status: 'Approval' | 'Cancelled' | 'Executed';
	date: string;
	threshold: number;
	callData: string;
	callHash: string;
	note: string;
	refetch?: () => void;
	setQueuedTransactions?: React.Dispatch<React.SetStateAction<IQueueItem[]>>;
	numberOfTransactions: number;
	notifications?: ITxNotification;
	multisigAddress: string;
	network: string;
	multi_id: string;
}

const Transaction: FC<ITransactionProps> = ({
	approvalsArray,
	note,
	transactionFields,
	totalAmount,
	refetch,
	callData,
	callHash,
	date,
	setQueuedTransactions,
	numberOfTransactions,
	threshold,
	notifications,
	multisigAddress,
	multi_id,
	network
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();
	const pathname = usePathname();

	const { apis } = useGlobalApiContext();
	const { address, setUserDetailsContextState, loggedInWallet } = useGlobalUserDetailsContext();
	const { tokensUsdPrice } = useGlobalCurrencyContext();
	const { records } = useActiveMultisigContext();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [failure, setFailure] = useState(false);
	const [getMultiDataLoading, setGetMultisigDataLoading] = useState(false);
	const [loadingMessages, setLoadingMessages] = useState('');
	const [openLoadingModal, setOpenLoadingModal] = useState(false);

	const { activeOrg } = useActiveOrgContext();
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [callDataString, setCallDataString] = useState<string>(callData || '');
	const [decodedCallData, setDecodedCallData] = useState<any>(null);
	const [isProxyApproval, setIsProxyApproval] = useState<boolean>(false);
	const [isProxyAddApproval, setIsProxyAddApproval] = useState<boolean>(false);
	const [isProxyRemovalApproval, setIsProxyRemovalApproval] = useState<boolean>(false);
	const [customTx, setCustomTx] = useState<boolean>(false);

	const [txnParams, setTxnParams] = useState<{ method: string; section: string }>({} as any);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [approvals, setApprovals] = useState<string[]>(approvalsArray || []);

	const token = chainProperties[network].tokenSymbol;
	const hash = pathname.slice(1);

	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === multisigAddress || checkMultisigWithProxy(item.proxy, multisigAddress)
	);

	const [amountUSD, setAmountUSD] = useState<string>('');

	const [category, setCategory] = useState<string>(
		transactionFields?.category ? generateCategoryKey(transactionFields?.category) : 'none'
	);

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<ITxnCategory>(
		transactionFields || { category: 'none', subfields: {} }
	);

	useEffect(() => {
		setAmountUSD(parseFloat(tokensUsdPrice[network]?.value?.toString())?.toFixed(2));
	}, [network, tokensUsdPrice]);

	useEffect(() => {
		if (!apis || !apis[network] || !apis[network].apiReady) return;

		const { data, error } = decodeCallData(callDataString, apis[network].api);
		if (error || !data) return;

		if (data?.extrinsicCall?.hash.toHex() !== callHash) {
			messageApi.error('Invalid call data');
			return;
		}

		setDecodedCallData(data.extrinsicCall?.toJSON());

		const callDataFunc = data.extrinsicFn;
		setTxnParams({ method: `${callDataFunc?.method}`, section: `${callDataFunc?.section}` });

		// store callData in BE
		(async () => {
			if (decodedCallData || callData) return; // already stored

			await nextApiClientFetch(`${SUBSTRATE_API_URL}/setTransactionCallData`, {
				callData: callDataString,
				callHash,
				network
			});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apis, callData, callDataString, callHash, network]);

	useEffect(() => {
		const fetchMultisigData = async (newMultisigAddress: string) => {
			const { data: newMultisigData, error: multisigFetchError } = await nextApiClientFetch<IMultisigAddress>(
				`${SUBSTRATE_API_URL}/getMultisigDataByMultisigAddress`,
				{
					multisigAddress: newMultisigAddress,
					network
				}
			);

			if (multisigFetchError || !newMultisigData || !multisig) {
				setGetMultisigDataLoading(false);
				return;
			}

			// if approval is for removing old multisig from proxy
			if (dayjs(newMultisigData?.created_at).isBefore(multisig.created_at)) {
				setGetMultisigDataLoading(false);
				setIsProxyRemovalApproval(true);
			} else {
				setGetMultisigDataLoading(false);
				setIsProxyAddApproval(true);
			}
		};
		if (decodedCallData && decodedCallData?.args?.proxy_type) {
			setIsProxyApproval(true);
		} else if (decodedCallData && decodedCallData?.args?.call?.args?.delegate?.id) {
			setGetMultisigDataLoading(true);
			fetchMultisigData(decodedCallData?.args?.call?.args?.delegate?.id);
		} else if (
			decodedCallData?.args &&
			!decodedCallData?.args?.dest &&
			!decodedCallData?.args?.call?.args?.dest &&
			!decodedCallData?.args?.calls?.[0]?.args?.dest &&
			!decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest
		) {
			setCustomTx(true);
		}
	}, [decodedCallData, multisig, network]);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleApproveTransaction = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady || !address) {
			return;
		}

		await setSigner(apis[network].api, loggedInWallet, network);

		if (!multisig) return;

		setLoading(true);
		setOpenLoadingModal(true);
		try {
			if (
				!decodedCallData?.args &&
				(!decodedCallData || !decodedCallData?.args?.value || !decodedCallData?.args?.dest?.id) &&
				!decodedCallData?.args?.call?.args?.calls &&
				!decodedCallData?.args?.calls &&
				!decodedCallData?.args?.proxy_type &&
				(!decodedCallData?.args?.call?.args?.value || !decodedCallData?.args?.call?.args?.dest?.id) &&
				(!decodedCallData?.args?.call?.args?.delegate || !decodedCallData?.args?.call?.args?.delegate?.id)
			) {
				setLoading(false);
				setOpenLoadingModal(false);
				return;
			}
			if (decodedCallData?.args?.proxy_type) {
				await approveProxy({
					api: apis[network].api,
					approvingAddress: address,
					callDataHex: callDataString,
					callHash,
					multisig,
					network,
					note: note || '',
					records,
					router,
					setLoadingMessages,
					setUserDetailsContextState
				});
			} else if (decodedCallData?.args?.call?.args?.delegate) {
				await approveAddProxy({
					api: apis[network].api,
					approvingAddress: address,
					callDataHex: callDataString,
					callHash,
					multisig,
					network,
					newMultisigAddress: decodedCallData?.args?.call?.args?.delegate?.id,
					note: note || '',
					proxyAddress: (multisig.proxy as string) || '',
					setLoadingMessages,
					setUserDetailsContextState
				});
			} else {
				await approveMultisigTransfer({
					amount: [networks.ASTAR, networks.AVAIL].includes(network)
						? bnToBn(decodedCallData.args.calls?.[0]?.args.value as number)
						: new BN(
								decodedCallData.args.value ||
									decodedCallData?.args?.call?.args?.value ||
									decodedCallData?.args?.calls?.[0]?.args.value ||
									decodedCallData?.args?.call?.args?.calls?.[0]?.args?.value ||
									0
						  ),
					api: apis[network].api,
					approvals,
					approvingAddress: address,
					callDataHex: callDataString,
					callHash,
					multisig,
					network,
					note: note || '',
					recipientAddress:
						decodedCallData?.args?.dest?.id ||
						decodedCallData?.args?.call?.args?.dest?.id ||
						decodedCallData?.args?.calls?.[0]?.args.dest?.id ||
						decodedCallData?.args?.call?.args?.calls?.[0]?.args.dest?.id ||
						'',
					setLoadingMessages
				});
			}
			setLoading(false);
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				setOpenLoadingModal(false);
			}, 5000);
			if (!openLoadingModal) {
				refetch?.();
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => {
				setFailure(false);
				setOpenLoadingModal(false);
			}, 5000);
		}
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleCancelTransaction = async () => {
		if (!apis || !apis[network] || !apis[network].apiReady || !address) {
			return;
		}

		await setSigner(apis[network].api, loggedInWallet, network);

		if (!multisig) return;

		setLoading(true);
		setOpenLoadingModal(true);
		try {
			if (
				!decodedCallData?.args &&
				(!decodedCallData || !decodedCallData?.args?.value || !decodedCallData?.args?.dest?.id) &&
				!decodedCallData?.args?.call?.args?.calls &&
				!decodedCallData?.args?.calls &&
				!decodedCallData?.args?.proxy_type &&
				(!decodedCallData?.args?.call?.args?.value || !decodedCallData?.args?.call?.args?.dest?.id) &&
				(!decodedCallData?.args?.call?.args?.delegate || !decodedCallData?.args?.call?.args?.delegate?.id)
			) {
				setLoading(false);
				setOpenLoadingModal(false);
				return;
			}
			if (decodedCallData?.args?.proxy_type) {
				await cancelProxy({
					api: apis[network].api,
					approvingAddress: address,
					callHash,
					multisig,
					network,
					setLoadingMessages
				});
				return;
			}
			await cancelMultisigTransfer({
				api: apis[network].api,
				approvingAddress: address,
				callHash,
				multisig,
				network,
				recipientAddress: decodedCallData.args.dest?.id || decodedCallData?.args?.call?.args?.dest?.id || '',
				setLoadingMessages
			});
			setLoading(false);
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				setOpenLoadingModal(false);
			}, 5000);
			if (!openLoadingModal) {
				document.getElementById(callHash)?.remove();
				if (numberOfTransactions < 2 && setQueuedTransactions) {
					setQueuedTransactions([]);
				}
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
			setFailure(true);
			setTimeout(() => {
				setFailure(false);
				setOpenLoadingModal(false);
			}, 5000);
		}
	};

	return (
		<>
			{contextHolder}

			<Collapse
				className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left max-sm:p-1'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel
					showArrow={false}
					key={`${callHash}`}
					header={
						getMultiDataLoading ? (
							<Skeleton
								active
								paragraph={{ rows: 0 }}
							/>
						) : (
							// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
							<div
								onClick={() => {
									toggleTransactionVisible(!transactionInfoVisible);
								}}
								className={classNames(
									'grid items-center grid-cols-10 cursor-pointer text-white font-normal text-sm leading-[15px] max-sm:flex max-sm:flex-wrap max-sm:gap-2'
								)}
							>
								<p className='col-span-2 flex items-center gap-x-3'>
									<span
										className={`flex items-center justify-center w-9 h-9 ${
											isProxyApproval || isProxyAddApproval || isProxyRemovalApproval
												? 'bg-[#FF79F2] text-[#FF79F2]'
												: 'bg-success text-red-500'
										} bg-opacity-10 p-[10px] rounded-lg`}
									>
										<ArrowUpRightIcon />
									</span>

									<span className='capitalize'>
										{isProxyApproval
											? 'Proxy'
											: isProxyAddApproval
											? 'Adding New Signatories to Multisig'
											: isProxyRemovalApproval
											? 'Remove Old Multisig From Proxy'
											: customTx
											? `${txnParams?.section}.${txnParams?.method}`
											: 'Sent'}
									</span>
									{!isProxyApproval && !isProxyAddApproval && !isProxyRemovalApproval && !customTx && (
										<span className='flex items-center gap-x-[6px]'>
											<ParachainIcon src={chainProperties[network]?.logo} />
											<span className='font-normal text-xs leading-[13px] text-failure'>
												-{' '}
												{decodedCallData && (decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value)
													? parseDecodedValue({
															network,
															value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value),
															withUnit: true
													  })
													: totalAmount
													? `${totalAmount} ${token}`
													: `? ${token}`}
											</span>
										</span>
									)}
								</p>
								<p className='col-span-2 flex items-center gap-x-[6px]'>
									<AddressComponent
										address={multisigAddress}
										isMultisig
										showNetworkBadge
										withBadge={false}
										network={multisig?.network}
									/>
								</p>
								<p className='col-span-2'>{dayjs(date).format('lll')}</p>
								<p
									className='col-span-2'
									onClick={(e) => e.stopPropagation()}
								>
									<TransactionFields
										callHash={callHash}
										category={category}
										setCategory={setCategory}
										transactionFieldsObject={transactionFieldsObject}
										setTransactionFieldsObject={setTransactionFieldsObject}
										multisigAddress={multisigAddress}
										network={network}
									/>
								</p>
								<p className='col-span-2 flex items-center justify-end gap-x-4'>
									{approvals && approvals.length > 0 ? (
										<span className='text-waiting'>
											{!approvals.includes(getEncodedAddress(address, network)) && 'Awaiting your Confirmation'} (
											{approvals.length}/{threshold})
										</span>
									) : (
										<span className='text-waiting'>Pending</span>
									)}
									<span className='text-white text-sm'>
										{transactionInfoVisible ? <CircleArrowUpIcon /> : <CircleArrowDownIcon />}
									</span>
								</p>
							</div>
						)
					}
				>
					<LoadingModal
						message={loadingMessages}
						loading={loading}
						success={success}
						open={openLoadingModal}
						onCancel={() => setOpenLoadingModal(false)}
					/>

					<div
					// className={classNames(
					// 'h-0 transition-all overflow-hidden',
					// {
					// 'h-auto overflow-auto': transactionInfoVisible
					// }
					// )}
					>
						<Divider className='bg-text_secondary my-5' />

						<SentInfo
							amount={
								decodedCallData?.args?.value ||
								decodedCallData?.args?.call?.args?.value ||
								decodedCallData?.args?.calls?.map((item: any) => item?.args?.value) ||
								decodedCallData?.args?.call?.args?.calls?.map((item: any) => item?.args?.value) ||
								''
							}
							amountUSD={amountUSD}
							callHash={callHash}
							callDataString={callDataString}
							callData={callData}
							date={date}
							approvals={approvals}
							threshold={threshold}
							loading={loading}
							getMultiDataLoading={getMultiDataLoading}
							recipientAddress={
								decodedCallData?.args?.dest?.id ||
								decodedCallData?.args?.call?.args?.dest?.id ||
								decodedCallData?.args?.calls?.map((item: any) => item?.args?.dest?.id) ||
								decodedCallData?.args?.call?.args?.calls?.map((item: any) => item?.args?.dest?.id)
							}
							setCallDataString={setCallDataString}
							handleApproveTransaction={handleApproveTransaction}
							handleCancelTransaction={handleCancelTransaction}
							note={note}
							isProxyApproval={isProxyApproval}
							isProxyAddApproval={isProxyAddApproval}
							delegate_id={decodedCallData?.args?.call?.args?.delegate?.id}
							isProxyRemovalApproval={isProxyRemovalApproval}
							notifications={notifications}
							transactionFields={transactionFieldsObject}
							customTx={customTx}
							decodedCallData={decodedCallData}
							txnParams={txnParams}
							multisig={multisig}
							network={network}
							api={apis?.[network]?.api}
							apiReady={apis?.[network]?.apiReady}
							category={category}
							setCategory={setCategory}
							setTransactionFields={setTransactionFieldsObject}
							multi_id={multi_id}
							setApprovals={setApprovals}
						/>
					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;
