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
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

const Assets = () => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { allAssets } = useMultisigAssetsContext();

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
						<AssetsTable assets={allAssets} />
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
