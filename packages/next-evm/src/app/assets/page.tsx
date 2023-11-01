// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AssetsTable from '@next-evm/app/components/Assets/AssetsTable';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { IAsset } from '@next-common/types';
import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import { chainProperties } from '@next-common/global/evm-network-constants';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

const Assets = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { address: userAddress, activeMultisig, gnosisSafe } = useGlobalUserDetailsContext();
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);
	const { network } = useGlobalApiContext();

	const handleGetAssets = useCallback(async () => {
		try {
			const tokenInfo = await gnosisSafe.getMultisigAllAssets(network, activeMultisig);
			const assets = tokenInfo.map((token: any) => ({
				balance_token: token.balance / 10 ** (token?.token?.decimals || chainProperties[network].decimals),
				balance_usd: token.fiatBalance,
				logoURI: token?.token?.logoUri || chainProperties[network].logo,
				name: token?.token?.symbol || chainProperties[network].tokenSymbol
			}));
			setAssetsData(assets);
			setLoading(false);
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, gnosisSafe, network]);
	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	if (loading) return <Loader size='large' />;

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<AddMultisigModal />
			{userAddress ? (
				<div className='grid grid-cols-12 gap-4'>
					<div className='col-start-1 col-end-13'>
						<div className='flex items-center justify-between'>
							<div className='flex items-end gap-x-4'>
								<h2 className='text-base font-bold text-white mt-3 ml-5'>Tokens</h2>
							</div>
							{/* <div className='flex items-center justify-center mr-5 mt-3'>
						<p className='text-text_secondary mx-2'>Currency:</p>
						<DropDown />
					</div> */}
						</div>
					</div>
					<div className='col-start-1 col-end-13 mx-5'>
						<AssetsTable assets={assetsData} />
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
