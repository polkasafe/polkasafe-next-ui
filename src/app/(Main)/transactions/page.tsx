// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LOGIN_URL } from '@substrate/app/global/end-points';
import { isValidAddress } from '@substrate/app/global/utils/isValidAddress';
import { isValidNetwork } from '@substrate/app/global/utils/isValidNetwork';
import { redirect } from 'next/navigation';
import { ISearchParams } from '@common/types/substrate';
import { ETransactionTab } from '@common/enum/substrate';
import { isValidOrg } from '@substrate/app/global/utils/isValidOrg';
import TransactionTemplate from './components/TransactionTemplete';

interface ITransactionProps {
	searchParams: ISearchParams;
}

export default async function Transaction({ searchParams }: ITransactionProps) {
	const { _multisig, _organisation, _network, _tab } = searchParams;

	if (!_organisation && !_multisig) {
		//  if not found redirect to login page
		redirect(LOGIN_URL);
	}
	if (_organisation && !isValidOrg(_organisation)) {
		redirect('/404');
	}

	if (
		(_organisation && isValidOrg(_organisation)) ||
		(_multisig && isValidAddress(_multisig) && isValidNetwork(_network))
	) {
		return (
			<div className='rounded-3xl bg-bg-main p-8 h-full'>
				<TransactionTemplate
					organisationId={_organisation}
					tab={_tab as ETransactionTab}
					multisig={_multisig}
					network={_network}
				/>
			</div>
		);
	}

	redirect('/404');
}
