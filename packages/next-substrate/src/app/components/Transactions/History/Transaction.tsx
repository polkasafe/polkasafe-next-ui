// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { chainProperties } from '@next-common/global/networkConstants';
import { ITransaction, ITxnCategory } from '@next-common/types';
import {
	ArrowDownLeftIcon,
	ArrowUpRightIcon,
	CircleArrowDownIcon,
	CircleArrowUpIcon
} from '@next-common/ui-components/CustomIcons';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { ParachainIcon } from '../../NetworksDropdown/NetworkCard';

import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';
import TransactionFields, { generateCategoryKey } from '../TransactionFields';

dayjs.extend(LocalizedFormat);

const Transaction: FC<ITransaction> = ({
	amount_token,
	callData,
	token,
	created_at,
	to,
	from,
	callHash,
	amount_usd,
	note,
	transactionFields,
	multisigAddress,
	network,
	multi_id
	// eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
	const { apis } = useGlobalApiContext();
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const { activeOrg } = useActiveOrgContext();
	const [txnParams, setTxnParams] = useState<{ method: string; section: string }>({} as any);
	const [customTx, setCustomTx] = useState<boolean>(false);
	const [isProxyApproval, setIsProxyApproval] = useState<boolean>(false);
	const [decodedCallData, setDecodedCallData] = useState<any>();
	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === multisigAddress || checkMultisigWithProxy(item.proxy, multisigAddress)
	);
	const type: 'Sent' | 'Received' =
		multisigAddress === from || multisig?.address === from || multisig?.proxy === from ? 'Sent' : 'Received';
	const pathname = usePathname();
	const hash = pathname.slice(1);

	const [category, setCategory] = useState<string>(
		transactionFields?.category ? generateCategoryKey(transactionFields?.category) : 'none'
	);

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<ITxnCategory>(
		transactionFields || { category: 'none', subfields: {} }
	);

	useEffect(() => {
		if (!apis || !apis[network] || !apis[network].apiReady || !callData) return;

		const { data, error } = decodeCallData(callData, apis[network].api);
		if (error || !data) return;

		if (data?.extrinsicCall?.hash.toHex() !== callHash) {
			return;
		}

		setDecodedCallData(data.extrinsicCall?.toJSON());

		const callDataFunc = data.extrinsicFn;
		setTxnParams({ method: `${callDataFunc?.method}`, section: `${callDataFunc?.section}` });

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apis, callData, callHash, network]);

	useEffect(() => {
		if (decodedCallData && decodedCallData?.args?.proxy_type) {
			setIsProxyApproval(true);
		} else if (
			decodedCallData?.args &&
			!decodedCallData?.args?.dest &&
			!decodedCallData?.args?.call?.args?.dest &&
			!decodedCallData?.args?.calls?.[0]?.args?.dest &&
			!decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest
		) {
			setCustomTx(true);
		}
	}, [decodedCallData]);

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
			bordered={false}
			defaultActiveKey={[`${hash}`]}
		>
			<Collapse.Panel
				showArrow={false}
				key={`${callHash}`}
				header={
					<div
						onClick={() => toggleTransactionVisible(!transactionInfoVisible)}
						className={classNames(
							'grid items-center grid-cols-10 cursor-pointer text-white font-normal text-sm leading-[15px] max-sm:flex max-sm:flex-wrap max-sm:gap-2'
						)}
					>
						<p className='col-span-2 flex items-center gap-x-3'>
							{type === 'Sent' || customTx ? (
								<span
									className={`flex items-center justify-center w-9 h-9 ${
										isProxyApproval ? 'bg-[#FF79F2] text-[#FF79F2]' : 'bg-success text-red-500'
									} bg-opacity-10 p-[10px] rounded-lg`}
								>
									<ArrowUpRightIcon />
								</span>
							) : (
								<span className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'>
									<ArrowDownLeftIcon />
								</span>
							)}
							<span className='capitalize'>
								{customTx
									? txnParams
										? `${txnParams.section}.${txnParams.method}`
										: 'Custom Transaction'
									: isProxyApproval
									? 'Proxy Creation'
									: type}
							</span>
						</p>
						{Number(amount_token) ? (
							<p className='col-span-2 flex items-center gap-x-[6px]'>
								{Boolean(amount_token) && <ParachainIcon src={chainProperties[network]?.logo} />}
								<span
									className={`font-normal text-xs leading-[13px] text-success ${type === 'Sent' && 'text-failure'}`}
								>
									{type === 'Sent' || !amount_token ? '-' : '+'} {Boolean(amount_token) && amount_token}{' '}
									{(Boolean(amount_token) && token) || chainProperties[network].tokenSymbol}
								</span>
							</p>
						) : (
							<p className='col-span-2'>-</p>
						)}
						<p className='col-span-2'>{dayjs(created_at).format('lll')}</p>
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
					{type === 'Received' ? (
						<ReceivedInfo
							amount={String(amount_token)}
							amountType={token}
							date={dayjs(created_at).format('llll')}
							from={from}
							callHash={callHash}
							amount_usd={amount_usd}
							to={String(to)}
							transactionFields={transactionFieldsObject}
							category={category}
							setCategory={setCategory}
							setTransactionFields={setTransactionFieldsObject}
							multisigAddress={multisig?.address || ''}
							note={note || ''}
						/>
					) : (
						<SentInfo
							amount={
								decodedCallData?.args?.value ||
								decodedCallData?.args?.call?.args?.value ||
								decodedCallData?.args?.calls?.map((item: any) => item?.args?.value) ||
								decodedCallData?.args?.call?.args?.calls?.map((item: any) => item?.args?.value) ||
								''
							}
							date={dayjs(created_at).format('llll')}
							multi_id={multi_id || ''}
							callHash={callHash}
							transactionFields={transactionFieldsObject}
							note={note}
							from={from}
							amount_usd={amount_usd}
							txnParams={txnParams}
							customTx={customTx}
							callData={callData}
							network={network}
							api={apis?.[network]?.api}
							apiReady={apis?.[network]?.apiReady}
							category={category}
							setCategory={setCategory}
							setTransactionFields={setTransactionFieldsObject}
							recipientAddresses={
								decodedCallData?.args?.dest?.id ||
								decodedCallData?.args?.call?.args?.dest?.id ||
								decodedCallData?.args?.calls?.map((item: any) => item?.args?.dest?.id) ||
								decodedCallData?.args?.call?.args?.calls?.map((item: any) => item?.args?.dest?.id)
							}
						/>
					)}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;
