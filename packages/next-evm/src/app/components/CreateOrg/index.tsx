/* eslint-disable no-tabs */
import { useCreateOrgStepsContext } from '@next-evm/context/CreateOrgStepsContext';
import React, { ReactNode, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { ArrowLeftCircle, ArrowRightCircle, CheckOutlined } from '@next-common/ui-components/CustomIcons';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { IMultisigAddress, IOrganisation } from '@next-common/types';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import CancelBtn from '../Settings/CancelBtn';
import OrgNameAndImageStep from './OrgNameAndImageStep';
import LinkMultisigStep from './LinkMultisigStep';
import ReviewOrgStep from './ReviewOrgStep';

interface ISteps {
	title: string;
	description: string;
	component: ReactNode;
}

const CreateOrg = () => {
	const { wallets } = useWallets();
	const { user } = usePrivy();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const router = useRouter();
	console.log('user', user);
	const [orgImageUrl, setOrgImageUrl] = useState<string>('');
	const [orgName, setOrgName] = useState<string>('');
	const [orgDesc, setOrgDesc] = useState<string>('');
	const [linkedMultisigs, setLinkedMultisigs] = useState<IMultisigAddress[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { setActiveOrg } = useActiveOrgContext();

	const { step, setStep } = useCreateOrgStepsContext();
	const steps: ISteps[] = [
		{
			component: (
				<OrgNameAndImageStep
					orgImageUrl={orgImageUrl}
					setOrgImageUrl={setOrgImageUrl}
					orgName={orgName}
					setOrgName={setOrgName}
					orgDesc={orgDesc}
					setOrgDesc={setOrgDesc}
				/>
			),
			description: 'Give details about your organisation to help customise experience better',
			title: 'Create Organisation'
		},
		{
			component: (
				<LinkMultisigStep
					linkedMultisigs={linkedMultisigs}
					setLinkedMultisigs={setLinkedMultisigs}
				/>
			),
			description: 'Add members to your organisation by creating or linking multisig(s)',
			title: 'Add Members'
		},
		{
			component: (
				<ReviewOrgStep
					orgImageUrl={orgImageUrl}
					loading={loading}
					orgName={orgName}
					linkedMultisigs={linkedMultisigs}
				/>
			),
			description: 'Review the details of your organisation, these can be edited later as well',
			title: 'Review'
		}
	];

	const createOrg = async () => {
		if (!orgName || !linkedMultisigs || linkedMultisigs.length === 0) return;
		console.log('fsffaf', {
			desc: orgDesc,
			multisigs: linkedMultisigs,
			name: orgName
		});
		setLoading(true);
		const createOrgRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/createOrganization_v1`, {
			body: JSON.stringify({
				imageURI: orgImageUrl,
				multisigs: linkedMultisigs,
				name: orgName
			}),
			headers: firebaseFunctionsHeader(wallets?.[0].address),
			method: 'POST'
		});
		const { data: createOrgData, error: createOrgError } = (await createOrgRes.json()) as {
			data: IOrganisation;
			error: string;
		};
		setLoading(false);
		console.log('create Org', createOrgData, createOrgError);
		if (createOrgData && !createOrgError) {
			setUserDetailsContextState((prev) => ({
				...prev,
				organisations: [...prev.organisations, createOrgData]
			}));
			setActiveOrg(createOrgData);
			if (typeof window !== 'undefined') localStorage.setItem('active-org', createOrgData.id);
			router.push('/');
			setStep(0);
		}
	};

	return (
		<div className='w-[50%] h-full'>
			{steps.map((item, i) =>
				i === step ? (
					<div>
						<p className='text-lg font-bold mb-2 text-white'>{item.title}</p>
						<p className='text-sm text-text_secondary mb-5'>{item.description}</p>
						{item.component}
					</div>
				) : null
			)}
			<div className='flex w-full justify-between mt-5'>
				<CancelBtn
					title='Back'
					icon={<ArrowLeftCircle className='text-sm' />}
					disabled={step === 0 || loading}
					onClick={() => setStep((prev) => prev - 1)}
				/>
				<PrimaryButton
					loading={loading}
					disabled={
						(step === 0 && !orgName) ||
						(step === 1 && linkedMultisigs.length === 0) ||
						(step === 2 && (!orgName || linkedMultisigs.length === 0))
					}
					icon={step === 2 && <CheckOutlined className='text-sm' />}
					onClick={() => (step === 2 ? createOrg() : setStep((prev) => prev + 1))}
					className='min-w-[120px] flex justify-center items-center gap-x-2 text-sm'
					size='large'
				>
					{step === 2 ? 'Confirm' : 'Next'}
					{step !== 2 && <ArrowRightCircle className='text-sm' />}
				</PrimaryButton>
			</div>
		</div>
	);
};

export default CreateOrg;
