import type { Metadata } from 'next';
// import { Inter } from 'next/font/google'
import '@next-evm/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import Providers from '@next-evm/app/providers';
import LayoutWrapper from './components/LayoutWrapper';

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	description: 'Enterprise asset management solution for EVM chains',
	title: 'Polkasafe',
	viewport: {
		height: 'device-height',
		initialScale: 1,
		maximumScale: 1,
		minimumScale: 1,
		width: 'device-width'
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body>
				<Providers>
					<LayoutWrapper>
						<NextTopLoader />
						{children}
					</LayoutWrapper>
				</Providers>
			</body>
		</html>
	);
}
