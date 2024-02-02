// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import Link from 'next/link';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';
import WatchlistComponents from '../../components/Watchlist';

const Watchlist = () => {
	const { userID } = useGlobalUserDetailsContext();

	return (
		<div className='bg-bg-main rounded-xl p-[20.5px] h-full relative'>
			<AddMultisigModal />
			{userID ? (
				<WatchlistComponents />
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

export default Watchlist;
