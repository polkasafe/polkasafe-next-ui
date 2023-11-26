// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Link from 'next/link';
import AssetsTable from '@next-evm/app/components/Assets/AssetsTable';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useState } from 'react';
import Loader from '@next-common/ui-components/Loader';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';
import ChangeCurrency from '../components/Assets/ChangeCurrency';

const Assets = () => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { allAssets, loadingAssets } = useMultisigAssetsContext();
	const { currency: globalCurrency } = useGlobalCurrencyContext();
	const [currency, setCurrency] = useState<string>(globalCurrency);

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<AddMultisigModal />
			{userAddress ? (
				<div className='scale-[80%] w-[125%] h-[125%] origin-top-left'>
					<div className='flex items-center justify-between mb-2 py-3 px-5'>
						<div className='flex items-end gap-x-4'>
							<h2 className='text-lg font-bold text-white'>Tokens</h2>
						</div>
						<ChangeCurrency
							currency={currency}
							setCurrency={setCurrency}
						/>
					</div>
					<div className='mx-5 h-full'>
						{loadingAssets ? (
							<Loader size='large' />
						) : (
							<AssetsTable
								currency={currency}
								assets={allAssets}
							/>
						)}
					</div>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Assets;
