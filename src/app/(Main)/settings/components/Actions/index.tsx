'use client';

import { ESettingsTab } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { ActionItems } from '@substrate/app/(Main)/settings/components/Actions/components/ActionItems';
import { SETTINGS_URL } from '@substrate/app/global/end-points';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface IActions {
	organisation: string;
	selectedTab: ESettingsTab;
}

const styles = {
	selectedTab: 'bg-highlight text-label border-0 py-3 px-5 text-sm font-medium',
	tab: 'bg-bg-main text-text-primary border-0 py-3 px-5 text-sm shadow-none'
};

export const Actions = ({ organisation, selectedTab }: IActions) => {
	const tabs = [
		{
			label: 'Signatories',
			tab: ESettingsTab.SIGNATORIES,
			link: SETTINGS_URL({ organisationId: organisation, tab: ESettingsTab.SIGNATORIES })
		},
		{
			label: 'Notifications',
			tab: ESettingsTab.NOTIFICATIONS,
			link: SETTINGS_URL({ organisationId: organisation, tab: ESettingsTab.NOTIFICATIONS })
		},
		{
			label: 'Transaction Fields',
			tab: ESettingsTab.TRANSACTION_FIELDS,
			link: SETTINGS_URL({ organisationId: organisation, tab: ESettingsTab.TRANSACTION_FIELDS })
		},
		{
			label: 'Admin',
			tab: ESettingsTab.ADMIN,
			link: SETTINGS_URL({ organisationId: organisation, tab: ESettingsTab.ADMIN })
		},
		{
			label: 'Overview',
			tab: ESettingsTab.OVERVIEW,
			link: SETTINGS_URL({ organisationId: organisation, tab: ESettingsTab.OVERVIEW })
		}
	];

	return (
		<div className='flex flex-col gap-5 h-full'>
			<div className='flex justify-between items-center'>
				<div className='flex gap-x-2 items-center'>
					{tabs.map((tab) => (
						<Link
							key={tab.tab}
							href={tab.link}
						>
							<Button
								size='large'
								variant={EButtonVariant.PRIMARY}
								className={twMerge(
									selectedTab === tab.tab && styles.selectedTab,
									selectedTab !== tab.tab && styles.tab
								)}
							>
								{tab.label}
							</Button>
						</Link>
					))}
				</div>
			</div>
			<ActionItems selectedTab={selectedTab} />
		</div>
	);
};
