// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import '@next-substrate/styles/globals.css';
import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import AppLayout from '@next-substrate/app/components/AppLayout';
import { ReactNode } from 'react';
import Providers from './providers';
import ProgressBar from './components/ProgressBar/ProgressBar';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	description: 'Generated by create next app',
	title: 'Create Next App',
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
							<>
								<ProgressBar />
								<AppLayout>{children}</AppLayout>
							</>
						) as ReactNode
					}
				</Providers>
			</body>
		</html>
	) as ReactNode;
}
