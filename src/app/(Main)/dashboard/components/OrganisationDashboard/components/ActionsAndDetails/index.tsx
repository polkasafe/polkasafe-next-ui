// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Button, { EButtonVariant } from '@common/global-ui-components/Button';

import { twMerge } from 'tailwind-merge';
import DownIcon from '@common/assets/icons/down.svg';
import { IMultisig } from '@common/types/substrate';
import { ENetwork, ETransactionTab } from '@common/enum/substrate';
import Link from 'next/link';
import { MULTISIG_DASHBOARD_URL, ORGANISATION_DASHBOARD_URL } from '@substrate/app/global/end-points';
import { QuickHistory } from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails/components/QuickHistory';
import { QuickQueue } from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails/components/QuickQueue';
import QuickMultisigs from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails/components/Multisigs';
import Members from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails/components/Members';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';

interface IDashboardTransactionProps {
	multisigs: Array<IMultisig>;
	multisig?: string;
	organisationId: string;
	network?: ENetwork;
	selectedTab: ETransactionTab;
}

const styles = {
	selectedTab: 'bg-highlight text-label border-0 py-3 px-5 text-sm font-medium',
	tab: 'bg-bg-main text-text-primary border-0 py-3 px-5 text-sm shadow-none'
};

export function ActionAndDetails({
	multisigs,
	organisationId,
	selectedTab,
	multisig,
	network
}: IDashboardTransactionProps) {
	const [organisation] = useOrganisation();
	const isSingleMultisig = multisig && network;
	const multisigData = multisigs.find((item) => item.address === multisig);
	const members = (isSingleMultisig ? multisigData?.signatories : organisation?.members) || [];

	const tabs = [
		{
			label: 'Queue',
			tab: ETransactionTab.QUEUE,
			link: isSingleMultisig
				? MULTISIG_DASHBOARD_URL({ multisig, network, organisationId, tab: ETransactionTab.QUEUE })
				: ORGANISATION_DASHBOARD_URL({ id: organisationId, tab: ETransactionTab.QUEUE })
		},
		{
			label: 'Transaction History',
			tab: ETransactionTab.HISTORY,
			link: isSingleMultisig
				? MULTISIG_DASHBOARD_URL({ multisig, network, organisationId, tab: ETransactionTab.HISTORY })
				: ORGANISATION_DASHBOARD_URL({ id: organisationId, tab: ETransactionTab.HISTORY })
		},
		{
			label: 'Members',
			tab: ETransactionTab.MEMBERS,
			link: isSingleMultisig
				? MULTISIG_DASHBOARD_URL({ multisig, network, organisationId, tab: ETransactionTab.MEMBERS })
				: ORGANISATION_DASHBOARD_URL({ id: organisationId, tab: ETransactionTab.MEMBERS })
		}
	];

	if (!isSingleMultisig)
		tabs.push({
			label: 'Multisigs',
			tab: ETransactionTab.MULTISIGS,
			link: ORGANISATION_DASHBOARD_URL({ id: organisationId, tab: ETransactionTab.MULTISIGS })
		});

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex justify-between items-center'>
				<div className='flex gap-x-4 items-center'>
					{tabs.map((tab) => (
						<Link
							key={tab.tab}
							href={tab.link}
						>
							<Button
								variant={EButtonVariant.PRIMARY}
								className={twMerge(
									selectedTab === tab.tab && styles.selectedTab,
									selectedTab !== tab.tab && styles.tab
								)}
								size='large'
							>
								{tab.label}
							</Button>
						</Link>
					))}
				</div>
			</div>
			{selectedTab === ETransactionTab.QUEUE && <QuickQueue multisigs={multisigs} />}
			{!isSingleMultisig && selectedTab === ETransactionTab.MULTISIGS && <QuickMultisigs organisationId={organisationId} multisigs={multisigs} />}
			{selectedTab === ETransactionTab.MEMBERS && <Members members={members} />}
			{selectedTab === ETransactionTab.HISTORY && <QuickHistory multisigs={multisigs} />}
		</div>
	);
}
