// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import '@common/styles/globals.scss';
import NextTopLoader from 'nextjs-toploader';
import React, { PropsWithChildren } from 'react';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { CREATE_ORGANISATION_URL, LOGIN_URL } from '@substrate/app/global/end-points';
import { redirect } from 'next/navigation';
import { Provider } from 'jotai';
import Initializers from '@substrate/app/Initializers';
import QueryProvider from '@substrate/app/providers/QueryClient';
import { LayoutWrapper } from '@common/global-ui-components/LayoutWrapper';
import SubstrateLayout from '@substrate/app/(Main)/SubstrateLayout';
import { getOrganisationsByUser } from '@sdk/polkasafe-sdk/src';
import { IOrganisation } from '@common/types/substrate';
import { Metadata } from 'next';

// import InitializeAssets from '@substrate/app/Initializers/InializeAssets';
// const inter = Inter({ subsets: ['latin'] })

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

export default async function MainLayout({ children }: PropsWithChildren) {
	const user = getUserFromCookie();
	if (!user) {
		redirect(LOGIN_URL);
	}

	// if (!user.currentOrganisation) {
	// 	redirect('/create-organisation');
	// }

	const { data: organisations } = (await getOrganisationsByUser({
		address: user.address
	})) as { data: Array<IOrganisation> };

	if (!organisations || organisations.length === 0) redirect(CREATE_ORGANISATION_URL);

	return (
		<html lang='en'>
			<body>
				<Provider>
					<LayoutWrapper>
						<QueryProvider>
							<Initializers
								userAddress={user.address}
								signature={user.signature}
								organisations={organisations}
							/>
							<NextTopLoader />
							<SubstrateLayout userAddress={user.address}>{children}</SubstrateLayout>
						</QueryProvider>
					</LayoutWrapper>
				</Provider>
			</body>
		</html>
	);
}
