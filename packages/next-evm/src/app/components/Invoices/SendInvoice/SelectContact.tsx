import './styles.css';
import { NETWORK } from '@next-common/global/evm-network-constants';
import { IMultisigAddress } from '@next-common/types';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';

const SelectContact = ({
	setSelectedAddresses
}: {
	setSelectedAddresses: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const { activeOrg } = useActiveOrgContext();
	const { organisations } = useGlobalUserDetailsContext();

	const [allMultisigs, setAllMultisigs] = useState<IMultisigAddress[]>([]);

	useEffect(() => {
		const multisigs: IMultisigAddress[] = [];
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
		<div className='max-h-[400px] overflow-y-auto w-[500px]'>
			<Checkbox.Group
				className='flex flex-col gap-y-2'
				onChange={(checkedValues) => setSelectedAddresses(checkedValues as string[])}
			>
				{allMultisigs.map((item) => (
					<Checkbox value={item.address}>
						<div className='rounded-xl p-3 bg-bg-secondary'>
							<AddressComponent
								address={item.address}
								fullAddress
								isMultisig
								network={item.network as NETWORK}
								withBadge={false}
								showNetworkBadge
							/>
						</div>
					</Checkbox>
				))}
				{activeOrg.addressBook.map((item) => (
					<Checkbox value={item.address}>
						<div className='rounded-xl p-3 bg-bg-secondary'>
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
