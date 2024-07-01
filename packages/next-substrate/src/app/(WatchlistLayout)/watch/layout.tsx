'use client';

import '@next-substrate/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import { Layout } from 'antd';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
import AddressDropdown from '@next-substrate/app/components/AddressDropdown';
import DonateBtn from '@next-common/components/Donate/DonateBtn';
import { DocsIcon } from '@next-common/ui-components/CustomIcons';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	const { Header } = Layout;

	return (
		<Layout className='min-h-screen'>
			<NextTopLoader />
			<Header className='bg-bg-main z-10 flex flex-row items-center sticky top-0 left-0 p-0 h-[70px]'>
				<section className='px-4 lg:px-8 flex-1 flex items-center gap-x-2'>
					<PolkasafeLogo />
					<article className='ml-auto flex items-center gap-x-3'>
						{/* <NetworksDropdown /> */}
						<AddressDropdown />
						<DonateBtn />
						<a
							href='https://docs.polkasafe.xyz/'
							target='_blank'
							rel='noreferrer'
							className='flex items-center justify-center gap-x-2 outline-none border-none text-waiting bg-waiting bg-opacity-10 rounded-lg p-2.5 shadow-none text-xs'
						>
							<DocsIcon /> Docs
						</a>
					</article>
				</section>
			</Header>
			<Layout.Content className='bg-bg-secondary p-[30px] h-full'>{children}</Layout.Content>
		</Layout>
	);
}
