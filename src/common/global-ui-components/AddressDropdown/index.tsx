// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Divider, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { ItemType } from 'antd/es/menu/interface';
import { SubstrateAddress } from '../SubstrateAddress';

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
	const addressItems: ItemType[] = accounts.map((account, index) => {
		if (account.address && account.name) {
			dropdownList[account.address] = account.name;
		}
		if (index === accounts.length - 1) {
			return {
				key: account.address,
				label: (
					<SubstrateAddress
						extensionName={account.name}
						className='text-white'
						address={account.address}
					/>
				)
			};
		}
		return {
			key: account.address,
			label: (
				<div>
					<SubstrateAddress
						extensionName={account.name}
						address={account.address}
					/>
					<Divider className='border-text-secondary my-0 mt-3' />
				</div>
			)
		};
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
			<div className='flex items-center justify-between'>
				<SubstrateAddress
					extensionName={dropdownList[selectedAddress]}
					address={selectedAddress}
				/>
				<CircleArrowDownIcon className='text-primary text-base' />
			</div>
		</Dropdown>
	);
};

export default AddressDropdown;
