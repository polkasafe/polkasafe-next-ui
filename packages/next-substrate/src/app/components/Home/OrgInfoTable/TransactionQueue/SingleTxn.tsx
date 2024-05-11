import { ReloadOutlined } from '@ant-design/icons';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { chainProperties } from '@next-common/global/networkConstants';
import { IQueueItem } from '@next-common/types';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ArrowUpRightIcon } from '@next-common/ui-components/CustomIcons';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import parseDecodedValue from '@next-substrate/utils/parseDecodedValue';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface IQueueTransactions {
	multisigAddress: string;
	network: string;
	transaction: IQueueItem;
}
const SingleTxn = ({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	multisigAddress,
	network,
	transaction // eslint-disable-next-line sonarjs/cognitive-complexity
}: IQueueTransactions) => {
	const { apis } = useGlobalApiContext();
	const { currency, currencyPrice, tokensUsdPrice } = useGlobalCurrencyContext();
	const { activeOrg } = useActiveOrgContext();
	const [amountUSD, setAmountUSD] = useState<string>('');

	const addressBook = (activeOrg && activeOrg.addressBook) || [];

	useEffect(() => {
		setAmountUSD(parseFloat(tokensUsdPrice[network]?.value?.toString())?.toFixed(2));
	}, [network, tokensUsdPrice]);

	let decodedCallData = null;
	let callDataFunc = null;

	if (transaction.callData && apis && apis[network]?.apiReady) {
		const { data, error } = decodeCallData(transaction.callData, apis[network].api) as { data: any; error: any };
		if (!error && data) {
			decodedCallData = data.extrinsicCall?.toJSON();
			callDataFunc = data.extrinsicFn;
		}
	}

	const isProxyApproval =
		decodedCallData && (decodedCallData?.args?.proxy_type || decodedCallData?.args?.call?.args?.delegate?.id);

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
			href={`/transactions?tab=Queue#${transaction.callHash}`}
			className='pb-2 mb-2 gap-x-3 grid grid-cols-9 max-sm:flex max-sm:flex-wrap max-sm:gap-2 max-sm:mb-5 max-sm:bg-bg-secondary max-sm:p-3 max-sm:rounded-lg'
		>
			<p className='flex items-center col-span-5 pr-5'>
				<div className='flex flex-1 items-center'>
					{isProxyApproval ? (
						<div className='bg-[#FF79F2] text-[#FF79F2] bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
							<ArrowUpRightIcon />
						</div>
					) : (
						<div className='bg-waiting text-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
							<ReloadOutlined />
						</div>
					)}
					<div className='ml-3'>
						<h1 className='text-md text-white truncate'>
							{decodedCallData && !isProxyApproval && !customTx ? (
								<span>
									To:{' '}
									{batchCallRecipients.length
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
							)}
						</h1>
						<p className='text-text_secondary text-xs'>
							{isProxyApproval ? 'Proxy Creation request in Process...' : 'In Process...'}
						</p>
					</div>
				</div>
				{!isProxyApproval && !customTx && Number(transaction?.totalAmount) ? (
					<div>
						<h1 className='text-md text-white'>
							- {transaction.totalAmount} {chainProperties[network].tokenSymbol}
						</h1>
						{!Number.isNaN(Number(amountUSD)) && (
							<p className='text-text_secondary text-right text-xs'>
								{(Number(amountUSD) * Number(transaction.totalAmount) * Number(currencyPrice)).toFixed(2)}{' '}
								{currencyProperties[currency].symbol}
							</p>
						)}
					</div>
				) : (
					<div>
						<h1 className='text-md text-white'>
							-{' '}
							{decodedCallData && (decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value)
								? parseDecodedValue({
										network,
										value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value),
										withUnit: true
								  })
								: `? ${chainProperties[network].tokenSymbol}`}
						</h1>
						{!Number.isNaN(Number(amountUSD)) &&
							(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value) && (
								<p className='text-white text-right text-xs'>
									{(
										Number(amountUSD) *
										Number(currencyPrice) *
										Number(
											parseDecodedValue({
												network,
												value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value),
												withUnit: false
											})
										)
									).toFixed(2)}{' '}
									{currencyProperties[currency].symbol}
								</p>
							)}
					</div>
				)}
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
