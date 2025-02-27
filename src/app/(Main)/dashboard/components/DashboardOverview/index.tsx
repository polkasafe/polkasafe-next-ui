// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork } from '@common/enum/substrate';
import DashboardCard from '@common/global-ui-components/DashboardCard';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useSearchParams } from 'next/navigation';
import OverviewCard from '@substrate/app/(Main)/dashboard/components/OverviewCard';
import { SendTransaction } from '@substrate/app/(Main)/components/SendTransaction';
import { TransactionDropdown } from '@substrate/app/(Main)/dashboard/components/TransactionDropdown';

export function DashboardOverview() {
	const [organisation] = useOrganisation();
	const address = useSearchParams().get('_multisig');
	const network = useSearchParams().get('_network') as ENetwork;
	const proxyAddress = useSearchParams().get('_proxy');

	const multisig = organisation?.multisigs?.find((item) => item.address === address && item.network === network);

	return (
		<SendTransaction
			address={address}
			network={network}
			proxyAddress={proxyAddress}
		>
			{multisig && network ? (
				<OverviewCard
					name={multisig.name}
					address={multisig.address}
					network={multisig.network}
					threshold={multisig.threshold}
					signatories={multisig.signatories}
				/>
			) : (
				<div className='flex flex-col gap-y-6'>
					<DashboardCard />
					<TransactionDropdown />
				</div>
			)}
		</SendTransaction>
	);
}
