// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AssetsTable from '@next-substrate/app/components/Assets/AssetsTable';
import MultisigDropdown from '@next-substrate/app/components/Assets/MultisigDropdown';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { IAsset } from '@next-common/types';
import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

const Assets = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { address, activeMultisig, isProxy, multisigAddresses, isSharedMultisig } = useGlobalUserDetailsContext();
	const [activeAddress, setActiveAddress] = useState<'Proxy' | 'Multisig'>(isProxy ? 'Proxy' : 'Multisig');
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);
	const { network } = useGlobalApiContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	const handleGetAssets = useCallback(async () => {
		try {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<IAsset[]>(`${SUBSTRATE_API_URL}/getAssetsForAddress`, {
				address: isSharedMultisig ? activeMultisig : activeAddress === 'Proxy' ? multisig.proxy : multisig.address,
				network
			});

			if (error) {
				setLoading(false);
				return;
			}

			if (data) {
				setAssetsData(data);
				setLoading(false);
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeAddress, activeMultisig, isSharedMultisig, multisig, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	if (loading) return <Loader size='large' />;

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			{address || isSharedMultisig ? (
				<div className='grid grid-cols-12 gap-4'>
					<AddMultisigModal />
					<div className='col-start-1 col-end-13'>
						<div className='flex items-center justify-between'>
							<div className='flex items-end gap-x-4'>
								<h2 className='text-base font-bold text-white mt-3 ml-5'>Tokens</h2>
								{multisig && multisig?.proxy && (
									<MultisigDropdown
										activeAddress={activeAddress}
										setActiveAddress={setActiveAddress}
									/>
								)}
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
