// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
'use client';

import { IMultisig } from '@common/types/substrate';
import SelectAccount from '@substrate/app/(Main)/dashboard/components/MultisigDashboard/components/SelectAccount';
import { ActionAndDetails } from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/ActionsAndDetails';
import { ETransactionTab } from '@common/enum/substrate';
import { Suspense } from 'react';
import { DashboardOverview } from '@substrate/app/(Main)/dashboard/components/DashboardOverview';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { DangerTriangleIcon } from '@common/global-ui-components/Icons';
import Button from '@common/global-ui-components/Button';
import { CreateProxyModal } from '@substrate/app/modal/CreateProxy';

interface IMultisigDashboardProps {
	multisig: IMultisig;
	tab: ETransactionTab;
	id: string;
}

function MultisigDashboard({ multisig, id, tab }: IMultisigDashboardProps) {
	return (
		<div className='flex flex-col gap-5 h-full'>
			<section className='mb-2 text-sm border border-waiting bg-[#ff9f1c]/[0.1] px-2 rounded-lg flex items-center gap-x-2'>
				<DangerTriangleIcon className='text-waiting text-lg' />
				<p className='text-white'>
					Create a proxy to edit or backup your Multisig.
				</p>
				<div>
					<CreateProxyModal iconClassName='text-waiting' buttonClassName='border-none outline-none text-waiting bg-transparent flex items-center p-0' multisig={multisig} />
				</div>
			</section>
			<div className='flex gap-5'>
				<div className='flex flex-col gap-4 basis-[55%]'>
					<Typography variant={ETypographyVariants.h1}>Overview</Typography>
					<DashboardOverview />
				</div>
				<div className='flex flex-col gap-4 basis-[45%]'>
					<SelectAccount
						multisig={multisig}
						organisationId={id}
					/>
				</div>
			</div>

			<div className='bg-bg-main rounded-3xl p-5 h-full'>
				<Suspense key={JSON.stringify(multisig)}>
					<ActionAndDetails
						multisigs={[multisig]}
						organisationId={id}
						selectedTab={tab}
						multisig={multisig.address}
						network={multisig.network}
					/>
				</Suspense>
			</div>
		</div>
	);
}

export default MultisigDashboard;
