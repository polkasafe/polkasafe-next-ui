// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import ManageMultisig from '@next-substrate/app/components/Settings/ManageMultisig';
import Notifications from '@next-substrate/app/components/Settings/Notifications';
import TransactionFields from '@next-substrate/app/components/Settings/TransactionFields';
import MultisigOverview from '@next-substrate/app/components/Settings/Overview';
import AdminSettings from '@next-substrate/app/components/Settings/Admin';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';

enum ETab {
	SIGNATORIES,
	NOTIFICATIONS,
	TRANSACTIONS,
	ADMIN,
	OVERVIEW
}

const Settings = () => {
	const [tab, setTab] = useState(ETab.SIGNATORIES);

	return (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left flex flex-col'>
			<AddMultisigModal />
			<div className='flex items-center mb-5'>
				<button
					onClick={() => setTab(ETab.SIGNATORIES)}
					className={`rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white ${
						// eslint-disable-next-line sonarjs/no-duplicate-string
						tab === ETab.SIGNATORIES && 'text-primary bg-highlight'
					}`}
				>
					Signatories
				</button>
				<button
					onClick={() => setTab(ETab.NOTIFICATIONS)}
					className={`rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white ${
						tab === ETab.NOTIFICATIONS && 'text-primary bg-highlight'
					}`}
				>
					Notifications
				</button>
				<button
					onClick={() => setTab(ETab.TRANSACTIONS)}
					className={`rounded-lg p-3 text-sm leading-[15px] text-white ${
						tab === ETab.TRANSACTIONS && 'text-primary bg-highlight'
					}`}
				>
					Transaction Fields
				</button>
				<button
					onClick={() => setTab(ETab.ADMIN)}
					className={`rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white ${
						tab === ETab.ADMIN && 'text-primary bg-highlight'
					}`}
				>
					Admin <span className='bg-success text-bg-secondary text-xs py-[2px] px-2 rounded-lg'>New</span>
				</button>
				<button
					onClick={() => setTab(ETab.OVERVIEW)}
					className={`rounded-lg p-3 text-sm leading-[15px] text-white ${
						tab === ETab.OVERVIEW && 'text-primary bg-highlight'
					}`}
				>
					Overview <span className='bg-success text-bg-secondary text-xs py-[2px] px-2 rounded-lg'>New</span>
				</button>
			</div>
			{tab === ETab.SIGNATORIES ? (
				<ManageMultisig />
			) : tab === ETab.NOTIFICATIONS ? (
				<Notifications />
			) : tab === ETab.TRANSACTIONS ? (
				<TransactionFields />
			) : tab === ETab.ADMIN ? (
				<AdminSettings />
			) : (
				<MultisigOverview />
			)}
		</div>
	);
};

export default Settings;
