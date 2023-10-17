// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import '@next-substrate/styles/globals.css';
import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import AppLayout from '@next-substrate/app/components/AppLayout';
import { ReactNode } from 'react';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';

// const inter = Inter({ subsets: ['latin'] });

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

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body>
				<Providers>
					{
						(
							<AppLayout>
								<NextTopLoader />
								{children}
							</AppLayout>
						) as ReactNode
					}
				</Providers>
			</body>
		</html>
	) as ReactNode;
}
