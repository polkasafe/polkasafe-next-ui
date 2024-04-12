import { IMultisigAddress, IOrganisation } from '@next-common/types';
import Image from 'next/image';
import React from 'react';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { NETWORK } from '@next-common/global/evm-network-constants';

const ReviewDetails = ({
	selectedOrg,
	multisig,
	amount
}: {
	selectedOrg: IOrganisation;
	multisig: IMultisigAddress;
	amount: string;
}) => {
	return (
		<div>
			<div className='rounded-xl p-3 flex justify-between items-center bg-[rgba(229, 233, 243, 0.08)] overflow-hidden mb-5 relative'>
				<div className='absolute w-[719px] h-[718px] -rotate-90 rounded-[719px] opacity-60 blur-[50px] big_circle right-[-20%] top-[-145%] shrink-0' />
				<div className='absolute w-[309px] h-[309px] -rotate-90 rounded-[309px] opacity-60 small_circle left-[41%] top-[-1%] shrink-0' />
				<div className='flex items-center gap-x-3'>
					<Image
						width={50}
						height={50}
						className='rounded-full h-[50px] w-[50px]'
						src={selectedOrg.imageURI || emptyImage}
						alt='empty profile image'
					/>
					<span className='font-bold text-sm text-white'>{selectedOrg.name}</span>
				</div>
			</div>
			<div className='border border-text_placeholder rounded-xl p-3 flex items-center justify-between'>
				<AddressComponent
					address={multisig.address}
					network={multisig.network as NETWORK}
					isMultisig
					withBadge={false}
				/>
				<div className='rounded-lg bg-bg-secondary px-2 py-1 flex justify-between items-center text-white'>
					{amount} USD
				</div>
			</div>
		</div>
	);
};

export default ReviewDetails;
