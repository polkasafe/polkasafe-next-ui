'use client';

import React, { PropsWithChildren } from 'react';
import { Layout as AntDLayout } from 'antd';
// import Icon from '@ant-design/icons';
import Image from 'next/image';
import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
// import LoginFrameImage from '@common/assets/login/login-page-frame.svg';
import loginBanner from '@common/assets/login/login-banner.png';

export function LoginLayout({ children }: PropsWithChildren) {
	return (
		<AntDLayout className='h-screen'>
			<div className='grid grid-cols-11 bg-bg-secondary h-full'>
				<div className='relative col-span-4 h-full max-sm:hidden'>
					<Image
						src={loginBanner}
						alt='Login Frame'
						layout='fill'
						objectFit='cover'
					/>
					{/* <Icon
						component={LoginFrameImage}
						className='w-100px'
					/> */}
				</div>
				{/* <span className='login-banner'>
					<LoginFrameImage />
				</span> */}
				<div className='col-span-7 p-[30px] flex flex-col max-sm:col-span-11 max-sm:p-3'>
					<div className='flex justify-end w-full mb-5'>
						<div className=''>
							<PolkasafeLogo />
						</div>
					</div>
					<AntDLayout.Content className='bg-bg-main p-[30px] h-full rounded-xl'>{children}</AntDLayout.Content>
				</div>
			</div>
		</AntDLayout>
	);
}
