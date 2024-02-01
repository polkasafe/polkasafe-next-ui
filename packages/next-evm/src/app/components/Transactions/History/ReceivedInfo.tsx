// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Spin } from 'antd';
import { ethers } from 'ethers';
import React, { FC, useEffect, useState } from 'react';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { StaticImageData } from 'next/image';
import getHistoricalTokenPrice from '@next-evm/utils/getHistoricalTokenPrice';
import dayjs from 'dayjs';
import FiatCurrencyValue from '@next-evm/ui-components/FiatCurrencyValue';
import tokenToUSDConversion from '@next-evm/utils/tokenToUSDConversion';
import getHistoricalNativeTokenPrice from '@next-evm/utils/getHistoricalNativeTokenPrice';

interface IReceivedInfoProps {
	addedOwner?: string;
	date: string;
	// time: string;
	callHash: string;
	note?: string;
	loading?: boolean;
	transfers: any[];
	tokenDetialsArray?: {
		tokenSymbol: string;
		tokenDecimals: number;
		tokenLogo: StaticImageData | string;
		tokenAddress: string;
	}[];
	network: NETWORK;
}

const ReceivedInfo: FC<IReceivedInfoProps> = ({
	date,
	transfers,
	callHash,
	note,
	loading,
	addedOwner,
	tokenDetialsArray,
	network
}) => {
	const [usdValue, setUsdValue] = useState<string[]>([]);
	useEffect(() => {
		if (!tokenDetialsArray || tokenDetialsArray.length === 0) return;
		tokenDetialsArray.forEach((token) => {
			if (!token.tokenAddress) {
				getHistoricalNativeTokenPrice(network, date).then((res) => {
					const currentPrice = res?.market_data?.current_price?.usd || '0';
					setUsdValue((prev) => [...prev, Number(currentPrice).toFixed(4)]);
				});
				return;
			}
			getHistoricalTokenPrice(network, token.tokenAddress, date).then((res) => {
				console.log('res', res);
				const prices: any[] = res?.prices || [];
				prices.forEach((item, i) => {
					if (i > 0 && dayjs(date).isBefore(dayjs(item[0])) && dayjs(date).isAfter(prices[i - 1][0])) {
						setUsdValue((prev) => [...prev, Number(item[1]).toFixed(4)]);
					}
				});
			});
		});
	}, [date, network, tokenDetialsArray]);

	return (
		<article className='p-4 rounded-lg bg-bg-main flex-1'>
			<div className='flex flex-col gap-y-1 max-h-[200px] overflow-y-auto'>
				{Array.isArray(transfers) &&
					transfers.map((item, i) => (
						<>
							<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
								<span>Received</span>
								<span className='text-failure'>
									{item.value
										? ethers.utils.formatUnits(
												BigInt(!Number.isNaN(item.value) ? item.value : 0).toString(),
												tokenDetialsArray?.[i]?.tokenDecimals || chainProperties[network].decimals
										  )
										: '?'}{' '}
									{tokenDetialsArray?.[i]?.tokenSymbol || chainProperties[network].tokenSymbol}{' '}
									{item.value && !Number.isNaN(item.value) && Number(usdValue[i]) !== 0 && (
										<>
											(
											<FiatCurrencyValue
												value={tokenToUSDConversion(
													ethers.utils.formatUnits(
														BigInt(!Number.isNaN(item.value) ? item.value : 0).toString(),
														tokenDetialsArray?.[i]?.tokenDecimals || chainProperties[network].decimals
													),
													usdValue[i]
												)}
											/>
											)
										</>
									)}
								</span>
								<span>From:</span>
							</p>
							<div className='mt-3'>
								<AddressComponent
									network={network}
									address={item.from}
								/>
							</div>
							{transfers.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
						</>
					))}
			</div>
			<Divider className='bg-text_secondary my-5' />
			<div className=' flex items-center gap-x-7 mb-3'>
				<span className='text-text_secondary font-normal text-sm leading-[15px]'>To:</span>
				<AddressComponent
					network={network}
					address={transfers?.[0]?.to?.toString()}
				/>
			</div>
			<div className='w-full max-w-[418px] flex items-center gap-x-5'>
				<span className='text-text_secondary font-normal text-sm leading-[15px]'>Txn Hash:</span>
				<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
					<span className='text-white font-normal text-sm leading-[15px]'>{shortenAddress(callHash, 10)}</span>
					<span className='flex items-center gap-x-2 text-sm'>
						<button onClick={() => copyText(callHash)}>
							<CopyIcon />
						</button>
						{/* <ExternalLinkIcon /> */}
					</span>
				</p>
			</div>
			{date && (
				<div className='w-full max-w-[418px] flex items-center gap-x-5 mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Executed:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<span className='text-white font-normal text-sm leading-[15px]'>{date}</span>
					</p>
				</div>
			)}
			{addedOwner && (
				<div className='w-full max-w-[418px] flex items-center  gap-x-5 mt-3'>
					<span className='text-text_secondary font-normal text-sm leading-[15px]'>Added Owner:</span>
					<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
						<AddressComponent
							network={network}
							address={addedOwner}
						/>
					</p>
				</div>
			)}
			{loading ? (
				<Spin className='mt-3' />
			) : (
				note && (
					<div className='w-full max-w-[418px] flex items-center gap-x-5 mt-3'>
						<span className='text-text_secondary font-normal text-sm leading-[15px]'>Note:</span>
						<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
							<span className='text-white font-normal text-sm leading-[15px] whitespace-pre'>{note}</span>
						</p>
					</div>
				)
			)}
		</article>
	);
};

export default ReceivedInfo;
