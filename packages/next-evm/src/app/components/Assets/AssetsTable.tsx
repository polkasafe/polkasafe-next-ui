// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC, useState } from 'react';
import { IAsset } from '@next-common/types';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IMultisigAssets, useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import SendFundsForm from '../SendFunds/SendFundsForm';
import NoAssets from './NoAssets';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

interface IAssetsProps {
	assets: IMultisigAssets;
	currency: string;
}
const AssetsTable: FC<IAssetsProps> = ({ assets, currency }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState(false);
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { organisationBalance } = useMultisigAssetsContext();
	const [selectedToken, setSeletedToken] = useState<IAsset>(assets[activeOrg?.multisigs[0]?.address]?.[0]);
	const { allCurrencyPrices } = useGlobalCurrencyContext();

	return (
		<div className='text-sm font-medium leading-[15px] overflow-y-auto'>
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
			{activeMultisig ? (
				assets && assets[activeMultisig]?.assets?.length > 0 ? (
					assets[activeMultisig]?.assets.map((asset, index) => {
						const { balance_token, balance_usd, logoURI, name, symbol } = asset;
						return (
							<>
								<article
									className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'
									key={index}
								>
									<div className='col-span-1 flex items-center'>
										<ParachainIcon src={logoURI} />
										<span
											title={symbol}
											className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
										>
											{symbol}
										</span>
									</div>
									<p
										title={balance_token}
										className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
									>
										{!Number.isNaN(balance_token) &&
											Number(balance_token)
												.toFixed(2)
												.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
										{name}
									</p>
									<p
										title={balance_usd}
										className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
									>
										{!Number.isNaN(balance_usd)
											? (allCurrencyPrices[currencyProperties[currency].symbol]
													? Number(balance_usd) * Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
													: Number(balance_usd)
												)
													.toFixed(2)
													.replace(/\d(?=(\d{3})+\.)/g, '$&,')
											: '-'}
									</p>
									<PrimaryButton
										onClick={() => {
											setOpenTransactionModal(true);
											setSeletedToken(asset);
										}}
										className='text-white w-fit'
										// disabled={notOwnerOfSafe}
									>
										<p className='font-normal text-sm'>Send</p>
									</PrimaryButton>
								</article>
								{assets[activeMultisig].assets.length - 1 !== index ? (
									<Divider className='bg-text_secondary my-0' />
								) : null}
							</>
						);
					})
				) : (
					<NoAssets />
				)
			) : activeOrg && organisationBalance && organisationBalance.tokens ? (
				Object.keys(organisationBalance.tokens).map((item, index) => {
					const { tokens } = organisationBalance;
					return (
						<>
							<article
								className='grid grid-cols-4 gap-x-5 py-6 px-4 text-white'
								key={item}
							>
								<div className='col-span-1 flex items-center'>
									<ParachainIcon src={tokens[item]?.logo} />
									<span
										title={tokens[item].name}
										className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'
									>
										{tokens[item].name}
									</span>
								</div>
								<p
									title={tokens[item].balance_token}
									className='sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{!Number.isNaN(tokens[item].balance_token) &&
										Number(tokens[item].balance_token)
											.toFixed(2)
											.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
									{tokens[item].tokenSymbol}
								</p>
								<p
									title={tokens[item].balance_usd}
									className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis col-span-1 flex items-center text-xs sm:text-sm'
								>
									{!Number.isNaN(tokens[item].balance_usd)
										? (allCurrencyPrices[currencyProperties[currency].symbol]
												? Number(tokens[item].balance_usd) *
													Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
												: Number(tokens[item].balance_usd)
											)
												.toFixed(2)
												.replace(/\d(?=(\d{3})+\.)/g, '$&,')
										: '-'}
								</p>
								<PrimaryButton
									onClick={() => {
										setOpenTransactionModal(true);
										setSeletedToken({ ...tokens[item], logoURI: tokens[item]?.logo, symbol: tokens[item].tokenSymbol });
									}}
									className='text-white w-fit'
									// disabled={notOwnerOfSafe}
								>
									<p className='font-normal text-sm'>Send</p>
								</PrimaryButton>
							</article>
							{Object.keys(tokens).length - 1 !== index ? <Divider className='bg-text_secondary my-0' /> : null}
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
