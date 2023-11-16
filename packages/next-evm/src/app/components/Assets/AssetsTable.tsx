// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC, useState } from 'react';
import { IAsset } from '@next-common/types';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';

import Image from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { chainProperties } from 'next-common/global/evm-network-constants';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import SendFundsForm from '../SendFunds/SendFundsForm';
import NoAssets from './NoAssets';

interface IAssetsProps {
	assets: IAsset[];
	currency: string;
}
const AssetsTable: FC<IAssetsProps> = ({ assets, currency }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState(false);
	const { network } = useGlobalApiContext();
	const [selectedToken, setSeletedToken] = useState<IAsset>(assets[0]);
	const { allCurrencyPrices } = useGlobalCurrencyContext();

	return (
		<div className='text-sm font-medium leading-[15px]'>
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				onCancel={() => setOpenTransactionModal(false)}
			>
				<SendFundsForm
					defaultToken={selectedToken}
					onCancel={() => setOpenTransactionModal(false)}
				/>
			</ModalComponent>
			<article className='grid grid-cols-4 gap-x-5 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>Asset</span>
				<span className='col-span-1'>Balance</span>
				<span className='col-span-1'>{currencyProperties[currency].symbol} Value</span>
				<span className='col-span-1'>Action</span>
			</article>
			{assets && assets.length > 0 ? (
				assets.map((asset, index) => {
					const { balance_token, balance_usd, logoURI, name, symbol } = asset;
					return (
						<>
							<article
								className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'
								key={index}
							>
								<div className='col-span-1 flex items-center'>
									<div className='flex items-center justify-center overflow-hidden rounded-full w-4 h-4'>
										<Image
											src={logoURI}
											alt='profile img'
											width={20}
											height={20}
										/>
									</div>
									<span
										title={name}
										className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
									>
										{name}
									</span>
								</div>
								<p
									title={balance_token}
									className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{balance_token} {symbol}
								</p>
								<p
									title={balance_usd}
									className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{!Number.isNaN(balance_usd)
										? (allCurrencyPrices[currencyProperties[currency].symbol]
												? Number(balance_usd) * Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
												: Number(balance_usd)
										  ).toFixed(2)
										: '-'}
								</p>
								<PrimaryButton
									onClick={() => {
										setOpenTransactionModal(true);
										setSeletedToken(asset);
									}}
									className={` text-white w-fit ${
										chainProperties[network].tokenSymbol !== name ? 'bg-secondary' : 'bg-primary'
									}`}
								>
									<p className='font-normal text-sm'>Send</p>
								</PrimaryButton>
							</article>
							{assets.length - 1 !== index ? <Divider className='bg-text_secondary my-0' /> : null}
						</>
					);
				})
			) : (
				<NoAssets />
			)}
		</div>
	);
};

export default AssetsTable;
