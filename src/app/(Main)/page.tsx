// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// import { SubstrateAddress } from '@common/global-ui-components/SubstrateAddress';
// import { EProjectType } from '@common/constants/projectConstants';
// import { SplashScreen } from '@common/global-ui-components/LayoutWrapper/SplashScreen';
import { redirect } from 'next/navigation';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { ISearchParams } from '@common/types/substrate';
import { LOGIN_URL, MULTISIG_DASHBOARD_URL, ORGANISATION_DASHBOARD_URL } from '../global/end-points';
import { Metadata } from 'next';
// import { cookies } from 'next/headers';

export interface IHomeProps {
	searchParams: ISearchParams;
}

export const metadata: Metadata = {
	description: 'User friendly Multisig for Polkadot & Kusama ecosystem',
	title: 'Polkasafe',
	viewport: {
		height: 'device-height',
		initialScale: 1,
		maximumScale: 1,
		minimumScale: 1,
		width: 'device-width'
	}
};

export default function Home({ searchParams }: IHomeProps) {
	const user = getUserFromCookie();
	const { _multisig, _organisation, _network } = searchParams;

	if (!user) {
		redirect(LOGIN_URL);
	}

	if (_multisig && _network && _organisation) {
		redirect(MULTISIG_DASHBOARD_URL({ multisig: _multisig, network: _network, organisationId: _organisation }));
	}
	if (_organisation) {
		redirect(ORGANISATION_DASHBOARD_URL({ id: _organisation }));
	}
	redirect(ORGANISATION_DASHBOARD_URL({ id: user.currentOrganisation }));
}
