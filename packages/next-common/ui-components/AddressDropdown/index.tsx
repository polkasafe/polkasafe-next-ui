// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Divider, Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useEffect, useState } from 'react';
import Address from '../Address';

import { CircleArrowDownIcon } from '../CustomIcons';

interface IAddressDropdownProps {
	defaultAddress?: string;
	accounts: InjectedAccount[];
	className?: string;
	disabled?: boolean;
	onAccountChange: (address: string) => void;
}

const AddressDropdown = ({ defaultAddress, className, accounts, disabled, onAccountChange }: IAddressDropdownProps) => {
	const [selectedAddress, setSelectedAddress] = useState('');
	useEffect(() => {
		if (defaultAddress) {
			setSelectedAddress(defaultAddress);
		}
	}, [defaultAddress]);

	const dropdownList: { [index: string]: string } = {};
	const addressItems: ItemType[] = [];

	accounts.forEach((account, index) => {
		if (index === accounts.length - 1) {
			addressItems.push({
				key: account.address,
				label: (
					<Address
						extensionName={account.name}
						className='text-white'
						address={account.address}
					/>
				)
			});
		} else {
			addressItems.push({
				key: account.address,
				label: (
					<div>
						<Address
							extensionName={account.name}
							className='text-white'
							address={account.address}
						/>
						<Divider className='bg-text_secondary my-0 mt-3' />
					</div>
				)
			});
		}

		if (account.address && account.name) {
			dropdownList[account.address] = account.name;
		}
	});
	return (
		<Dropdown
			disabled={disabled}
			trigger={['click']}
			className={`border-primary bg-bg-secondary cursor-pointer rounded-xl border px-3 py-2 ${className}`}
			menu={{
				items: addressItems,
				onClick: (e) => {
					setSelectedAddress(e.key);
					onAccountChange(e.key);
				}
			}}
		>
			<div className='flex items-center justify-between '>
				<Address
					extensionName={dropdownList[selectedAddress]}
					address={selectedAddress}
				/>
				<CircleArrowDownIcon className='text-primary text-base' />
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
