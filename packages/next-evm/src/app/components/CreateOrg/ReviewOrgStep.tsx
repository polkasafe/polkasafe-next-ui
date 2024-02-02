import './styles.css';
import Image from 'next/image';
import React from 'react';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { EditIcon } from '@next-common/ui-components/CustomIcons';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { useCreateOrgStepsContext } from '@next-evm/context/CreateOrgStepsContext';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { IMultisigAddress } from '@next-common/types';

const ReviewOrgStep = ({
	orgName,
	linkedMultisigs,
	loading,
	orgImageUrl,
	notCreateOrg
}: {
	orgName: string;
	linkedMultisigs: IMultisigAddress[];
	loading: boolean;
	orgImageUrl: string;
	notCreateOrg?: boolean;
}) => {
	const { setStep } = useCreateOrgStepsContext();
	return (
		<div className='rounded-xl p-6 bg-bg-main flex flex-col'>
			<div className='rounded-xl p-3 flex justify-between items-center bg-[rgba(229, 233, 243, 0.08)] overflow-hidden mb-5 relative'>
				<div className='absolute w-[719px] h-[718px] -rotate-90 rounded-[719px] opacity-60 blur-[50px] big_circle right-[-20%] top-[-145%] shrink-0' />
				<div className='absolute w-[309px] h-[309px] -rotate-90 rounded-[309px] opacity-60 small_circle left-[41%] top-[-1%] shrink-0' />
				<div className='flex items-center gap-x-3'>
					<Image
						width={50}
						height={50}
						className='rounded-full h-[50px] w-[50px]'
						src={orgImageUrl || emptyImage}
						alt='empty profile image'
					/>
					<span className='font-bold text-sm text-white'>{orgName}</span>
				</div>
				{notCreateOrg ? null : (
					<PrimaryButton
						onClick={() => setStep(0)}
						icon={<EditIcon />}
						disabled={loading}
					>
						Edit
					</PrimaryButton>
				)}
			</div>
			<h2 className='text-text_secondary text-[10px] font-primary flex items-center gap-x-2 mb-2'>
				<span>MULTISIGS</span>
				<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-5 w-5 font-normal text-xs'>
					{linkedMultisigs.length}
				</span>
			</h2>
			{linkedMultisigs && linkedMultisigs.length > 0 && (
				<div className='max-h-[250px] overflow-y-auto mb-5'>
					{linkedMultisigs.map((item) => (
						<div className='p-2 mb-2 border border-text_placeholder rounded-xl flex justify-between items-center'>
							<AddressComponent
								address={item?.address}
								isMultisig
								showNetworkBadge
								withBadge={false}
								signatories={item?.signatories?.length}
								threshold={item?.threshold}
								network={item?.network as NETWORK}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ReviewOrgStep;
