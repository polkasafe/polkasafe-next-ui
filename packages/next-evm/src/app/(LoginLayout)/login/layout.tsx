'use client';

import '@next-evm/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import loginFrame from '@next-common/assets/login-page-frame.png';
import TreasurEaseLogo from '@next-common/assets/TreasurEase-logo.svg';
import Image from 'next/image';
import { Layout } from 'antd';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return (
		<Layout className='h-screen'>
			<NextTopLoader />
			<div className='grid grid-cols-11 bg-bg-secondary h-full'>
				<div className='relative col-span-4 h-full'>
					<Image
						src={loginFrame}
						alt='Login'
						className='absolute w-full h-full'
					/>
				</div>
				<div className='col-span-7 p-[30px] flex flex-col'>
					<div className='flex justify-end w-full mb-5'>
						<div className='h-[30px] w-[180px]'>
							<TreasurEaseLogo />
						</div>
					</div>
					<Layout.Content className='bg-bg-main p-[30px] h-full rounded-xl'>{children}</Layout.Content>
				</div>
			</div>
		</Layout>
	);
}
