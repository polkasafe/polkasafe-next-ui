import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import React from 'react';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import SingleMember from './SingleMember';

const MembersTable = () => {
	const { activeOrg } = useActiveOrgContext();
	return (
		<div>
			<div className='bg-bg-secondary mb-2 rounded-lg p-3 scale-90 h-[111%] w-[111%] origin-top-left text-text_secondary grid items-center grid-cols-9'>
				<p className='col-span-2 pl-3'>Name</p>
				<p className='col-span-5'>Address</p>
				<p className='col-span-2'>Actions</p>
			</div>
			<div className='flex flex-col gap-y-3'>
				{activeOrg.members.map((member) => {
					const addressBookRef = activeOrg.addressBook?.find((item) => item.address === member);
					return (
						<SingleMember
							name={addressBookRef?.name || DEFAULT_ADDRESS_NAME}
							address={member}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default MembersTable;
