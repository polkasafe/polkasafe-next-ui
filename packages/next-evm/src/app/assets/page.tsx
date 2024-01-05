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
import { Button } from 'antd';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';
import ChangeCurrency from '../components/Assets/ChangeCurrency';
import NFTsTable from '../components/Assets/NFtsTable';

enum ETab {
	Tokens,
	NFTs
}

const Assets = () => {
	const { address: userAddress, activeMultisig, isSharedSafe } = useGlobalUserDetailsContext();
	const { allAssets, allNfts, loadingAssets } = useMultisigAssetsContext();
	const { currency: globalCurrency } = useGlobalCurrencyContext();
	const [currency, setCurrency] = useState<string>(globalCurrency);

	const [tab, setTab] = useState(ETab.Tokens);

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg px-5 py-3'>
			<AddMultisigModal />
			{userAddress || (activeMultisig && isSharedSafe) ? (
				<div className='scale-[80%] w-[125%] h-[125%] origin-top-left'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-end gap-x-4'>
							<h2 className='text-lg font-bold text-white'>Assets</h2>
						</div>
						<ChangeCurrency
							currency={currency}
							setCurrency={setCurrency}
						/>
					</div>
					<div className='flex items-center mb-4'>
						<Button
							onClick={() => setTab(ETab.Tokens)}
							// icon={<QueueIcon />}
							size='large'
							className={`font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								// eslint-disable-next-line sonarjs/no-duplicate-string
								tab === ETab.Tokens && 'text-primary bg-highlight'
							}`}
						>
							Tokens
						</Button>
						<Button
							onClick={() => setTab(ETab.NFTs)}
							// icon={<HistoryIcon />}
							size='large'
							className={`rounded-lg font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none ${
								tab === ETab.NFTs && 'text-primary bg-highlight'
							}`}
						>
							NFTs
						</Button>
					</div>
					<div className='h-full'>
						{loadingAssets ? (
							<Loader size='large' />
						) : tab === ETab.Tokens ? (
							<AssetsTable
								currency={currency}
								assets={allAssets}
							/>
						) : (
							<NFTsTable nfts={allNfts} />
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
