// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@common/styles/globals.scss';
import NextTopLoader from 'nextjs-toploader';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'jotai';
import QueryProvider from '@substrate/app/providers/QueryClient';
import { LayoutWrapper } from '@common/global-ui-components/LayoutWrapper';
import WatchlistLayout from '@substrate/app/(Watchlist)/components/WatchlistLayout';
import InitializeTransaction from '@substrate/app/Initializers/initializeTransaction';
import InitializeAssets from '@substrate/app/Initializers/InializeAssets';

export default async function MainLayout({ children }: PropsWithChildren) {
	return (
		<html lang='en'>
			<body>
				<Provider>
					<LayoutWrapper>
						<QueryProvider>
							<NextTopLoader />
							<InitializeTransaction />
							<InitializeAssets />
							<WatchlistLayout>{children}</WatchlistLayout>
						</QueryProvider>
					</LayoutWrapper>
				</Provider>
			</body>
		</html>
	);
}
