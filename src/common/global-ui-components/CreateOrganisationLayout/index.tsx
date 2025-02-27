'use client';

import { Layout, Steps } from 'antd';
import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
import './style.css';
import Image from 'next/image';
import lockIcon from '@assets/icons/multisig-lock-image.png';

import { OutlineCheckIcon } from '@common/global-ui-components/Icons';
import { useOrgStepsContext } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps } from '@common/enum/substrate';

const getCreateOrganisationSteps = (value: number) => {
	switch (value) {
		case 0:
			return ECreateOrganisationSteps.ORGANISATION_DETAILS;
		case 1:
			return ECreateOrganisationSteps.ADD_MULTISIG;
		case 2:
			return ECreateOrganisationSteps.REVIEW;
		default:
			return ECreateOrganisationSteps.ORGANISATION_DETAILS;
	}
};

const getValueByCreateOrganisationSteps = (value: ECreateOrganisationSteps) => {
	switch (value) {
		case ECreateOrganisationSteps.ORGANISATION_DETAILS:
			return 0;
		case ECreateOrganisationSteps.ADD_MULTISIG:
			return 1;
		case ECreateOrganisationSteps.REVIEW:
			return 2;
		default:
			return 0;
	}
};

export default function CreateOrganisationLayout({ children }: { children: React.ReactNode }) {
	const { step: stepValue, setStep } = useOrgStepsContext();

	const step = getValueByCreateOrganisationSteps(stepValue);

	return (
		<Layout
			hasSider
			className='min-h-[100vh]'
		>
			<div className='w-[260px] p-[30px] bg-bg-main top-0 bottom-0 left-0 h-screen fixed max-sm:hidden flex flex-col'>
				<div className='mb-12 h-[30px] w-[180px]'>
					<PolkasafeLogo />
				</div>
				<div className='h-[300px]'>
					<Steps
						className='h-full'
						current={step}
						onChange={(value) => setStep(getCreateOrganisationSteps(value))}
						direction='vertical'
						items={['Create Organisation', 'Create/Link Multisig', 'Review'].map((title, i) => ({
							// disabled: i > step,
							icon: (
								<div
									className={`px-2 py-1 rounded-lg text-sm ${
										i > step
											? 'border border-text_secondary text-text-secondary bg-bg-main'
											: i === step
												? 'bg-primary text-white'
												: 'bg-success text-bg-main'
									}`}
								>
									{i < step ? <OutlineCheckIcon /> : i + 1}
								</div>
							),
							title: (
								<span className={`text-sm ${i < step ? 'text-success' : i === step ? 'text-label' : 'text-white'}`}>
									{title}
								</span>
							)
						}))}
					/>
				</div>
				<div className='flex-1' />
				<div className='rounded-xl bg-bg-secondary py-6 px-3 flex flex-col gap-y-3 relative'>
					<div className='absolute top-[-105px] left-[40px]'>
						<Image
							src={lockIcon}
							alt='Multisig'
							height={150}
							width={120}
						/>
					</div>
					<p className='text-white text-sm font-medium'>What Is a Multisig Wallet?</p>
					<p className='text-text-secondary text-xs font-medium'>
						Multisignature wallets require more than one private key and adds a layer of security to cryptocurrency
						asset storage.
					</p>
				</div>
			</div>
			<div className='hidden lg:block w-full max-w-[260px] relative left-0px' />
			<Layout.Content className='bg-bg-secondary p-[30px] max-w-[100%] lg:max-w-[calc(100%-180px)]'>
				{children}
			</Layout.Content>
		</Layout>
	);
}
