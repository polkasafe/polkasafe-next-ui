// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Identicon from '@polkadot/react-identicon';
import { Divider } from 'antd';
import React, { FC } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import { ITxnCategory } from '@next-common/types';
import TransactionFields from '../TransactionFields';

interface IReceivedInfoProps {
	amount: string;
	amountType: string;
	amount_usd: number;
	date: string;
	// time: string;
	from: string;
	to: string;
	callHash: string;
	note?: string;
	transactionFields?: ITxnCategory;
	multisigAddress: string;
	category: string;
	setCategory: React.Dispatch<React.SetStateAction<string>>;
	setTransactionFields: React.Dispatch<React.SetStateAction<ITxnCategory>>;
}

const ReceivedInfo: FC<IReceivedInfoProps> = ({
	amount,
	to,
	amount_usd,
	amountType,
	date,
	from,
	callHash,
	note,
	transactionFields,
	multisigAddress,
	category,
	setCategory,
	setTransactionFields
}) => {
	const { addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	return (
		<article className='p-4 rounded-lg bg-bg-main flex-1 max-sm:flex-wrap'>
			<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px] max-sm:gap-3'>
				<span>Received</span>
				<span className='text-success'>
					{amount} {amountType} ({(Number(amount_usd) * Number(currencyPrice)).toFixed(2)}{' '}
					{currencyProperties[currency].symbol})
				</span>
				<span className='max-sm:hidden'>from:</span>
			</p>
			<div className='mt-3 flex items-center gap-x-4 max-sm:hidden'>
				<span className='sm:hidden'>from:</span>
				<Identicon
					size={30}
					value={from}
					theme='polkadot'
				/>
				<div className='flex flex-col gap-y-[6px]'>
					<p className='font-medium text-sm leading-[15px] text-white'>
						{addressBook?.find((item) => item.address === from)?.name || DEFAULT_ADDRESS_NAME}
					</p>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span>{getEncodedAddress(from, network)}</span>
						<span className='flex items-center gap-x-2 text-sm'>
							<button onClick={() => copyText(from, true, network)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`https://${network}.subscan.io/account/${getEncodedAddress(from, network)}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</span>
					</p>
				</div>
			</div>
			<div className=' flex items-center justify-between gap-x-7 my-3 sm:hidden'>
				<span className='text-white font-normal text-sm leading-[15px]'>from:</span>
				<AddressComponent
					address={from}
					network={network}
				/>
			</div>
			<Divider className='bg-text_secondary my-5' />
			<section className='w-[50%]'>
				<div className=' flex items-center justify-between gap-x-7 mb-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>To:</span>
					<AddressComponent
						address={to}
						network={network}
					/>
				</div>
				<div className='w-full flex items-center justify-between gap-x-5'>
					<span className='text-text_secondary font-normal text-sm leading-[15px] max-sm:w-[100xp]'>Txn_Hash:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callHash, 5)}</span>
						<span className='flex items-center gap-x-2 text-sm'>
							<button onClick={() => copyText(callHash)}>
								<CopyIcon />
							</button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
				</div>
				{date && (
					<div className='w-full flex items-center justify-between gap-x-5 mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Executed:</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<span className='text-white font-normal text-sm leading-[15px] max-sm:w-[120px]'>{date}</span>
						</p>
					</div>
				)}
			</section>
			{!!transactionFields && Object.keys(transactionFields).length !== 0 && (
				<>
					<div className='flex items-center gap-x-5 mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Category:</span>
						<TransactionFields
							callHash={callHash}
							category={category}
							setCategory={setCategory}
							transactionFieldsObject={transactionFields}
							setTransactionFieldsObject={setTransactionFields}
							multisigAddress={multisigAddress}
							network={network}
						/>
					</div>
					{transactionFields &&
						transactionFields.subfields &&
						Object.keys(transactionFields?.subfields).map((key) => {
							const subfield = transactionFields.subfields[key];
							return (
								<div
									key={key}
									className='flex items-center gap-x-5 mt-3'
								>
									<span className='text-text_secondary font-normal text-sm leading-[15px]'>{subfield.name}:</span>
									<span className='text-waiting bg-waiting bg-opacity-5 border border-solid border-waiting rounded-lg px-[6px] py-[3px]'>
										{subfield.value}
									</span>
								</div>
							);
						})}
				</>
			)}
			{note && (
				<div className='w-full max-w-[418px] flex items-center gap-x-5 mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Note:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px] whitespace-pre'>{note}</span>
					</p>
				</div>
			)}
		</article>
	);
};

export default ReceivedInfo;
