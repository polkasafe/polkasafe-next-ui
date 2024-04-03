import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { Checkbox } from 'antd';
import React from 'react';

const SelectContact = ({
	setSelectedAddresses
}: {
	setSelectedAddresses: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const { activeOrg } = useActiveOrgContext();

	return (
		<div className='max-h-[400px] overflow-y-auto w-[500px]'>
			<Checkbox.Group
				className='flex flex-col gap-y-2'
				onChange={(checkedValues) => setSelectedAddresses(checkedValues as string[])}
			>
				{activeOrg.addressBook.map((item) => (
					<Checkbox value={item.address}>
						<div className='rounded-xl p-3 bg-bg-secondary w-[115%]'>
							<AddressComponent
								address={item.address}
								fullAddress
								withEmail
							/>
						</div>
					</Checkbox>
				))}
			</Checkbox.Group>
		</div>
	);
};

export default SelectContact;
