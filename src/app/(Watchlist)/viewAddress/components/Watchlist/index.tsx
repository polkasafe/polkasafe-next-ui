// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
'use client';

import { IMultisig } from '@common/types/substrate';
import SelectAccount from '@substrate/app/(Main)/dashboard/components/MultisigDashboard/components/SelectAccount';
import { ActionAndDetails } from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails';
import { ETransactionTab } from '@common/enum/substrate';
import { Suspense } from 'react';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import OverviewCard from '@substrate/app/(Watchlist)/viewAddress/components/OverviewCard';

interface IMultisigDashboardProps {
	multisig: IMultisig;
	tab: ETransactionTab;
}

function WatchList({ multisig, tab }: IMultisigDashboardProps) {
	return (
		<div className='flex flex-col gap-5 h-full'>
			<div className='flex gap-5'>
				<div className='flex flex-col gap-4 basis-[55%]'>
					<Typography variant={ETypographyVariants.h1}>Overview</Typography>
					<OverviewCard
						name={multisig.name}
						address={multisig.address}
						network={multisig.network}
						threshold={multisig.threshold}
						signatories={multisig.signatories}
					/>
				</div>
				<div className='flex flex-col gap-4 basis-[45%]'>
					<SelectAccount
						multisig={multisig}
						organisationId=''
					/>
				</div>
			</div>

			<div className='bg-bg-main rounded-3xl p-5 h-full'>
				<Suspense key={JSON.stringify(multisig)}>
					<ActionAndDetails
						multisigs={[multisig]}
						selectedTab={tab as ETransactionTab}
						multisig={multisig.address}
						network={multisig.network}
						organisationId=''
					/>
				</Suspense>
			</div>
		</div>
	);
}

export default WatchList;
