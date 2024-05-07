'use client';

import '@next-substrate/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import loginFrame from '@next-common/assets/login-page-frame.png';
import Image from 'next/image';
import { Layout } from 'antd';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return (
		<Layout className='h-screen'>
			<NextTopLoader />
			<div className='grid grid-cols-11 bg-bg-secondary h-full'>
				<div className='relative col-span-4 h-full max-sm:hidden'>
					<Image
						src={loginFrame}
						alt='Login'
						className='absolute w-full h-full'
					/>
				</div>
				<div className='col-span-7 p-[30px] flex flex-col max-sm:col-span-11 max-sm:p-3'>
					<div className='flex justify-end w-full mb-5'>
						<div className=''>
							<PolkasafeLogo />
						</div>
					</div>
					<Layout.Content className='bg-bg-main p-[30px] h-full rounded-xl'>{children}</Layout.Content>
				</div>
			</div>
		</Layout>
	);
}
