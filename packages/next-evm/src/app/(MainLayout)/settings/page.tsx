// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import ManageMultisig from '@next-evm/app/components/Settings/ManageMultisig';
import Notifications from '@next-evm/app/components/Settings/Notifications';
import TransactionFields from '@next-evm/app/components/Settings/TransactionFields';
import { Button } from 'antd';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';
import ChangeCurrency from '../../components/Assets/ChangeCurrency';

enum ETab {
	SIGNATORIES,
	NOTIFICATIONS,
	TRANSACTIONS
}

const Settings = () => {
	const [tab, setTab] = useState(ETab.SIGNATORIES);
	return (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left'>
			<AddMultisigModal />
			<div className='flex items-center justify-between mb-5'>
				<div className='flex items-center'>
					<Button
						size='large'
						onClick={() => setTab(ETab.SIGNATORIES)}
						className={`font-medium text-sm leading-[15px text-white outline-none border-none ${
							// eslint-disable-next-line sonarjs/no-duplicate-string
							tab === ETab.SIGNATORIES && 'text-primary bg-highlight'
						}`}
					>
						{/* <QueueIcon /> */}
						Signatories
					</Button>
					<Button
						size='large'
						onClick={() => setTab(ETab.NOTIFICATIONS)}
						className={`font-medium text-sm leading-[15px] text-white outline-none border-none ${
							tab === ETab.NOTIFICATIONS && 'text-primary bg-highlight'
						}`}
					>
						{/* <HistoryIcon/> */}
						Notifications
					</Button>
					<Button
						size='large'
						onClick={() => setTab(ETab.TRANSACTIONS)}
						className={`font-medium text-sm leading-[15px] text-white outline-none border-none ${
							tab === ETab.TRANSACTIONS && 'text-primary bg-highlight'
						}`}
					>
						Transaction Fields
					</Button>
				</div>
				<ChangeCurrency />
			</div>
			{tab === ETab.SIGNATORIES ? (
				<ManageMultisig />
			) : tab === ETab.NOTIFICATIONS ? (
				<Notifications />
			) : (
				<TransactionFields />
			)}
		</div>
	);
};

export default Settings;
