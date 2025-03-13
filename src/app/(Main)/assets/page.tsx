// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LOGIN_URL } from '@substrate/app/global/end-points';
import { isValidAddress } from '@substrate/app/global/utils/isValidAddress';
import { isValidNetwork } from '@substrate/app/global/utils/isValidNetwork';
import { redirect } from 'next/navigation';

import { ISearchParams } from '@common/types/substrate';
import Secure from '@substrate/app/(Main)/Secure';
import AssetsTemplate from './components/AssetsTemplate';

interface IAssetsProps {
	searchParams: ISearchParams;
}

async function Assets({ searchParams }: IAssetsProps) {
	const { _multisig, _organisation, _network } = searchParams;

	if (!_organisation && !_multisig) {
		// check local storage for login user details
		//  if not found redirect to login page
		redirect(LOGIN_URL);
	}

	if (_multisig && (!isValidAddress(_multisig) || !isValidNetwork(_network))) {
		redirect('/404');
	}

	if (_organisation) {
		return (
			<Secure organisation={_organisation}>
				<AssetsTemplate />
			</Secure>
		);
	}

	if (_multisig && isValidAddress(_multisig) && isValidNetwork(_network)) {
		return <AssetsTemplate />;
	}
	redirect('/404');
}

export default Assets;
