// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AssetsTable from '@next-substrate/app/components/Assets/AssetsTable';
import MultisigDropdown from '@next-substrate/app/components/Assets/MultisigDropdown';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import { useMultisigAssetsContext } from '@next-substrate/context/MultisigAssetsContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import formatBalance from '@next-substrate/utils/formatBalance';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';
import ChangeCurrency from '../../components/Settings/ChangeCurrency';

const Assets = () => {
	const { userID, activeMultisig, isProxy, multisigAddresses, isSharedMultisig } = useGlobalUserDetailsContext();
	const [activeAddress, setActiveAddress] = useState<'Proxy' | 'Multisig'>(isProxy ? 'Proxy' : 'Multisig');

	const { allAssets, loadingAssets, organisationBalance } = useMultisigAssetsContext();
	const { currency: globalCurrency, allCurrencyPrices } = useGlobalCurrencyContext();
	const [currency, setCurrency] = useState<string>(globalCurrency);

	const multisig = multisigAddresses.find(
		(item) => item.address === activeMultisig || checkMultisigWithProxy(item.address, activeMultisig)
	);

	if (loadingAssets) return <Loader size='large' />;

	return (
		<div className='h-[75vh] bg-bg-main rounded-lg px-5 py-3'>
			<AddMultisigModal />
			{userID || isSharedMultisig ? (
				<div className='scale-[80%] w-[125%] h-[125%] origin-top-left flex flex-col'>
					<div className='flex items-end gap-x-4 mb-4'>
						<h2 className='text-xl font-bold text-white'>Assets</h2>
						{multisig && multisig?.proxy && (
							<MultisigDropdown
								activeAddress={activeAddress}
								setActiveAddress={setActiveAddress}
							/>
						)}
						<div className='flex-1' />
						<ChangeCurrency
							currency={currency}
							setCurrency={setCurrency}
						/>
					</div>
					<div className='mb-4'>
						<p className='text-sm text-text_secondary mb-3'>Total Balance</p>
						<p className='text-[30px] font-bold text-white'>
							{formatBalance(
								activeMultisig
									? Number(allAssets[activeMultisig]?.fiatTotal) *
											Number(allCurrencyPrices[currencyProperties[currency]?.symbol]?.value) ||
											allAssets[activeMultisig]?.fiatTotal
									: Number(organisationBalance?.total) *
											Number(allCurrencyPrices[currencyProperties[currency]?.symbol]?.value) ||
											organisationBalance?.total
							)}{' '}
							{currencyProperties[currency].symbol}
						</p>
					</div>
					<div className='h-full overflow-y-auto'>
						<AssetsTable />
					</div>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/login'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Assets;
