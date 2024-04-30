import { currencyProperties } from '@next-common/global/currencyConstants';
import { chainProperties } from '@next-common/global/networkConstants';
import { ITransaction } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@next-common/ui-components/CustomIcons';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface IHistoryTransactions {
	multisigAddress: string;
	network: string;
	transaction: ITransaction;
}
const SingleTxn = ({
	multisigAddress,
	network,
	transaction // eslint-disable-next-line sonarjs/cognitive-complexity
}: IHistoryTransactions) => {
	const { apis } = useGlobalApiContext();
	const { currency, currencyPrice, tokensUsdPrice } = useGlobalCurrencyContext();
	const { activeOrg } = useActiveOrgContext();
	const [amountUSD, setAmountUSD] = useState<string>('');

	const addressBook = (activeOrg && activeOrg.addressBook) || [];

	useEffect(() => {
		setAmountUSD(parseFloat(tokensUsdPrice[network]?.value?.toString()).toFixed(2));
	}, [network, tokensUsdPrice]);

	const sent = transaction.from === multisigAddress;
	let decodedCallData = null;
	let callDataFunc = null;

	if (transaction.callData && apis && apis[network]?.apiReady) {
		const { data, error } = decodeCallData(transaction.callData, apis[network].api) as { data: any; error: any };
		if (!error && data) {
			decodedCallData = data.extrinsicCall?.toJSON();
			callDataFunc = data.extrinsicFn;
		}
	}
	const customTx =
		decodedCallData?.args &&
		!decodedCallData?.args?.dest &&
		!decodedCallData?.args?.call?.args?.dest &&
		!decodedCallData?.args?.calls?.[0]?.args?.dest &&
		!decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest;

	const destSubstrateAddress =
		decodedCallData && (decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
			? getSubstrateAddress(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
			: '';
	const destAddressName = addressBook?.find((address) => getSubstrateAddress(address.address) === destSubstrateAddress)
		?.name;
	const toText =
		decodedCallData && destSubstrateAddress && destAddressName
			? destAddressName
			: shortenAddress(
					decodedCallData && (decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id)
						? String(
								getEncodedAddress(
									decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id,
									network
								)
						  )
						: ''
			  );

	let batchCallRecipients: string[] = [];
	if (decodedCallData && decodedCallData?.args?.calls) {
		batchCallRecipients = decodedCallData?.args?.calls?.map((call: any) => {
			const dest = call?.args?.dest?.id;
			return (
				addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
				shortenAddress(getEncodedAddress(dest, network) || '')
			);
		});
	} else if (decodedCallData && decodedCallData?.args?.call?.args?.calls) {
		batchCallRecipients = decodedCallData?.args?.call?.args?.calls?.map((call: any) => {
			const dest = call?.args?.dest?.id;
			return (
				addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name ||
				shortenAddress(getEncodedAddress(dest, network) || '')
			);
		});
	}

	return (
		<Link
			href={`/transactions?tab=History#${transaction.callHash}`}
			className='pb-2 mb-2 gap-x-3 grid grid-cols-9 max-sm:flex max-sm:flex-wrap max-sm:gap-2 max-sm:mb-5 max-sm:bg-bg-secondary max-sm:p-3 max-sm:rounded-lg'
		>
			<p className='flex items-center col-span-5 pr-5'>
				<div className='flex flex-1 items-center'>
					<div
						className={`${
							sent ? 'bg-failure text-failure' : 'bg-success text-success'
						} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}
					>
						{sent ? <ArrowUpRightIcon /> : <ArrowDownLeftIcon />}
					</div>
					<div className='text-md text-white truncate'>
						{sent ? (
							decodedCallData && !customTx ? (
								<span>
									To:{' '}
									{batchCallRecipients?.length
										? batchCallRecipients?.map(
												(a, index) => `${a}${index !== batchCallRecipients.length - 1 ? ', ' : ''}`
										  )
										: toText}
								</span>
							) : customTx ? (
								<span>
									Txn: {callDataFunc?.section}.{callDataFunc?.method}
								</span>
							) : (
								<span>Txn: {shortenAddress(transaction.callHash)}</span>
							)
						) : (
							<h1 className='text-md text-white'>
								From:{' '}
								{addressBook?.find((address) => address.address === getEncodedAddress(transaction.from, network))
									?.name || shortenAddress(getEncodedAddress(transaction.from, network) || '')}
							</h1>
						)}
						<p className='text-text_secondary text-xs'>{dayjs(transaction.created_at).format('D-MM-YY [at] HH:mm')}</p>
					</div>
				</div>
				<div>
					{sent ? (
						<h1 className='text-md text-failure text-right'>
							-
							{Number(transaction.amount_token) ? (
								<>
									{transaction.amount_token} {transaction.token || chainProperties[network].tokenSymbol}
								</>
							) : (
								'?'
							)}
						</h1>
					) : (
						<h1 className='text-md text-success text-right'>
							+{transaction.amount_token} {transaction.token}
						</h1>
					)}
					{Number(transaction.amount_token) ? (
						<p className='text-text_secondary text-right text-xs'>
							{!Number.isNaN(Number(transaction.amount_usd))
								? (Number(transaction.amount_usd) * Number(currencyPrice)).toFixed(3)
								: Number.isNaN(Number(amountUSD))
								? '0.00'
								: (Number(transaction.amount_token) * Number(amountUSD) * Number(currencyPrice)).toFixed(3)}{' '}
							{currencyProperties[currency].symbol}
						</p>
					) : (
						''
					)}
				</div>
			</p>
			<p className='col-span-2'>
				<AddressComponent
					address={multisigAddress}
					withBadge={false}
					isMultisig
					network={network}
					showNetworkBadge
				/>
			</p>
			<p className='text-white text-sm flex items-center gap-x-2 col-span-2 capitalize'>
				{dayjs(transaction.created_at).format('lll')}
			</p>
		</Link>
	);
};

export default SingleTxn;
