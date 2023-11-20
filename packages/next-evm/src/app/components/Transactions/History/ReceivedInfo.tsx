// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Spin } from 'antd';
import { ethers } from 'ethers';
import React, { FC } from 'react';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { StaticImageData } from 'next/image';

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
}

const ReceivedInfo: FC<IReceivedInfoProps> = ({
	date,
	transfers,
	callHash,
	note,
	loading,
	addedOwner,
	tokenDetialsArray
}) => {
	const { network } = useGlobalApiContext();

	return (
		<article className='p-4 rounded-lg bg-bg-main flex-1'>
			<div className='flex flex-col gap-y-1 max-h-[200px] overflow-y-auto'>
				{Array.isArray(transfers) &&
					transfers.map((item, i) => (
						<>
							<p className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'>
								<span>Sent</span>
								<span className='text-failure'>
									{item.value
										? ethers.utils.formatUnits(
												String(item.value),
												tokenDetialsArray?.[i]?.tokenDecimals || chainProperties[network].decimals
										  )
										: '?'}{' '}
									{tokenDetialsArray?.[i]?.tokenSymbol || chainProperties[network].tokenSymbol}{' '}
								</span>
								<span>From:</span>
							</p>
							<div className='mt-3'>
								<AddressComponent address={item.from} />
							</div>
							{transfers.length - 1 !== i && <Divider className='bg-text_secondary mt-1' />}
						</>
					))}
			</div>
			<Divider className='bg-text_secondary my-5' />
			<div className=' flex items-center gap-x-7 mb-3'>
				<span className='text-text_secondary font-normal text-sm leading-[15px]'>To:</span>
				<AddressComponent address={transfers?.[0]?.to?.toString()} />
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
						<AddressComponent address={addedOwner} />
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
