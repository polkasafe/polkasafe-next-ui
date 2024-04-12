'use client';

import { ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import AddMultisigModal from '@next-substrate/app/components/Multisig/AddMultisigModal';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import Link from 'next/link';
import React from 'react';
import TreasuryAnalytics from '@next-substrate/app/components/TreasuryAnalytics';

const TreasuryAnalyticsPage = () => {
	const { address } = useGlobalUserDetailsContext();
	return (
		<div className='bg-bg-main rounded-xl p-[20.5px] h-full relative'>
			<AddMultisigModal />
			{address ? (
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
