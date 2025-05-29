// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import '@common/styles/globals.scss';
import { LoginLayout as GlobalLoginLayout } from '@common/global-ui-components/LoginLayout';
import NextTopLoader from 'nextjs-toploader';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';
import { ORGANISATION_DASHBOARD_URL } from '@substrate/app/global/end-points';
import QueryProvider from '@substrate/app/providers/QueryClient';
import { getWagmiConfig } from '@substrate/app/global/lib/auth-config';
import { cookieToInitialState } from 'wagmi';
import { headers } from 'next/headers';

export default async function LoginLayout({ children }: PropsWithChildren) {
	const user = getUserFromCookie();
	const config = await getWagmiConfig();
	const initialState = cookieToInitialState(config, (await headers()).get('cookie'));
	

	if (user) {
		const { currentOrganisation } = user;
		if (currentOrganisation) {
			redirect(ORGANISATION_DASHBOARD_URL({ id: currentOrganisation }));
		}
	}
	return (
		<html lang='en'>
			<body>
				<NextTopLoader />
				<GlobalLoginLayout>
					<QueryProvider initialWagmiState={initialState}>
						{children}
					</QueryProvider>
				</GlobalLoginLayout>
			</body>
		</html>
	);
}
