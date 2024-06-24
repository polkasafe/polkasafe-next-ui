'use client';

import '@next-substrate/styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';
import { Layout, Steps } from 'antd';
import { OutlineCheckIcon } from '@next-common/ui-components/CustomIcons';
import './style.css';
import { useCreateOrgStepsContext } from '@next-substrate/context/CreateOrgStepsContext';

export default function CreateOrgLayout({ children }: { children: React.ReactNode }) {
	const { step, setStep } = useCreateOrgStepsContext();

	return (
		<>
			<NextTopLoader />
			<Layout
				hasSider
				className='min-h-[100vh]'
			>
				<div className='w-[260px] p-[30px] bg-bg-main top-0 bottom-0 left-0 h-screen fixed max-sm:hidden'>
					<div className='mb-12 h-[30px] w-[180px]'>
						<PolkasafeLogo />
					</div>
					<div className='h-[300px]'>
						<Steps
							className='h-full'
							current={step}
							onChange={(value) => setStep(value)}
							direction='vertical'
							items={['Create Organisation', 'Add Members', 'Review'].map((title, i) => ({
								// disabled: i > step,
								icon: (
									<div
										className={`px-2 py-1 rounded-lg text-sm ${
											i > step
												? 'border border-text_secondary text-text_secondary bg-bg-main'
												: i === step
												? 'bg-primary text-white'
												: 'bg-success text-bg-main'
										}`}
									>
										{i < step ? <OutlineCheckIcon /> : i + 1}
									</div>
								),
								title: (
									<span className={`text-sm ${i < step ? 'text-success' : i === step ? 'text-primary' : 'text-white'}`}>
										{title}
									</span>
								)
							}))}
						/>
					</div>
				</div>
				<div className='hidden lg:block w-full max-w-[260px] relative left-0px' />
				<Layout.Content className='bg-bg-secondary p-[30px] max-w-[100%] lg:max-w-[calc(100%-180px)]'>
					{children}
				</Layout.Content>
			</Layout>
		</>
	);
}
