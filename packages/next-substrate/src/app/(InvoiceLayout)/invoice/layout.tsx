'use client';

import '@next-substrate/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
import { Layout } from 'antd';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { useRouter } from 'next/navigation';
import { WalletIcon } from '@next-common/ui-components/CustomIcons';

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	return (
		<>
			<NextTopLoader />
			<Layout className='min-h-[100vh] bg-bg-main p-[30px] max-w-[100%]'>
				<div className='flex w-full justify-between'>
					<PolkasafeLogo />
					<PrimaryButton
						onClick={() => router.push('/login')}
						icon={<WalletIcon />}
					>
						Login
					</PrimaryButton>
				</div>
				<Layout.Content className='flex items-center justify-center'>{children}</Layout.Content>
			</Layout>
		</>
	);
}
