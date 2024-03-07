'use client';

import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import AddMultisigModal from '@next-evm/app/components/Multisig/AddMultisigModal';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import Link from 'next/link';
import React from 'react';
import TreasuryAnalytics from '@next-evm/app/components/TreasuryAnalytics';

const TreasuryAnalyticsPage = () => {
	const { userID } = useGlobalUserDetailsContext();
	return (
		<div className='bg-bg-main rounded-xl p-[20.5px] h-full relative'>
			<AddMultisigModal />
			{userID ? (
				<TreasuryAnalytics />
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

export default TreasuryAnalyticsPage;
