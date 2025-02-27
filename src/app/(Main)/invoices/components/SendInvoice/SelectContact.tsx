import { IMultisig, IOrganisation } from '@common/types/substrate';
import { Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import Address from '@common/global-ui-components/Address';

const SelectContact = ({
	setSelectedAddresses,
	organisations,
	organisation
}: {
	setSelectedAddresses: React.Dispatch<React.SetStateAction<string[]>>;
	organisations: IOrganisation[];
	organisation: IOrganisation;
}) => {

	const [allMultisigs, setAllMultisigs] = useState<IMultisig[]>([]);

	useEffect(() => {
		const multisigs: IMultisig[] = [];
		organisations.forEach((item) => {
			item.multisigs.forEach((m) => {
				if (multisigs.length === 0 || !multisigs.some((a) => a.address === m.address)) {
					multisigs.push(m);
				}
			});
		});
		setAllMultisigs(multisigs);
	}, [organisations]);

	return (
		<div className='max-h-[400px] overflow-y-auto w-[550px]'>
			<Checkbox.Group
				className='flex flex-col gap-y-2'
				onChange={(checkedValues) => setSelectedAddresses(checkedValues as string[])}
			>
				{allMultisigs.map((item) => (
					<Checkbox value={item.address}>
						<div className='rounded-xl p-3 bg-bg-secondary'>
							<Address
								address={item.address}
								fullAddress
								isMultisig
								network={item.network}
								withBadge={false}
								showNetworkBadge
							/>
						</div>
					</Checkbox>
				))}
				{/* {organisation.addressBook.map((item) => (
					<Checkbox value={item.address}>
						<div className='rounded-xl p-3 bg-bg-secondary'>
							<Address
								address={item.address}
								fullAddress
								withEmail
							/>
						</div>
					</Checkbox>
				))} */}
			</Checkbox.Group>
		</div>
	);
};

export default SelectContact;
