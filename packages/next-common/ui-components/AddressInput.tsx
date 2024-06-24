// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { AutoComplete, Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import React, { useEffect, useState } from 'react';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';

import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import AddressComponent from './AddressComponent';
import { OutlineCloseIcon } from './CustomIcons';

interface IAddressInput {
	onChange: (address: string) => void;
	placeholder?: string;
	defaultAddress?: string;
	showMultisigAddresses?: boolean;
}

const AddressInput: React.FC<IAddressInput> = ({
	onChange,
	placeholder,
	defaultAddress,
	showMultisigAddresses = false
}: IAddressInput) => {
	const { network } = useGlobalApiContext();
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();

	const [selectedAddress, setSelectedAddress] = useState<string>(defaultAddress || '');
	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	const [isValidAddress, setIsValidAddress] = useState(true);
	const { addressBook } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	const multisig = multisigAddresses.find(
		(item) => item.address === activeMultisig || checkMultisigWithProxy(item.address, activeMultisig)
	);

	useEffect(() => {
		if (selectedAddress && !getSubstrateAddress(selectedAddress)) {
			setIsValidAddress(false);
		} else {
			setIsValidAddress(true);
		}
	}, [selectedAddress]);

	useEffect(() => {
		const allAddresses: string[] =
			multisig && showMultisigAddresses
				? multisig.proxy && typeof multisig.proxy === 'string'
					? [multisig.proxy, multisig.address]
					: multisig.proxy && typeof multisig.proxy !== 'string' && multisig.proxy.length > 0
					? [...multisig.proxy.map(({ address }) => address), multisig.address]
					: [multisig.address]
				: [];
		if (records) {
			Object.keys(records).forEach((address) => {
				allAddresses.push(getEncodedAddress(address, network) || address);
			});
		}
		addressBook.forEach((item) => {
			if (!allAddresses.includes(getEncodedAddress(item.address, network) || item.address)) {
				allAddresses.push(item.address);
			}
		});
		setAutoCompleteAddresses(
			allAddresses.map((address) => ({
				label: (
					<AddressComponent
						withBadge={false}
						address={address}
					/>
				),
				value: address
			}))
		);
	}, [addressBook, multisig, network, records, showMultisigAddresses]);

	return (
		<div className='w-full'>
			<Form.Item
				name='sender'
				rules={[{ required: true }]}
				help={!isValidAddress && 'Please add a valid Address.'}
				className='my-0 border-0 p-0 outline-0'
				validateStatus={selectedAddress && isValidAddress ? 'success' : 'error'}
			>
				<div className='flex items-center'>
					{selectedAddress &&
					autocompleteAddresses.some(
						(item) => item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(selectedAddress)
					) ? (
						<div className='border-primary flex h-full w-full items-center justify-between rounded-lg border border-solid p-2'>
							{
								autocompleteAddresses.find(
									(item) =>
										item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(selectedAddress)
								)?.label
							}
							<button
								className='bg-highlight z-100 flex h-6 w-6 items-center justify-center rounded-full border-none outline-none'
								onClick={() => {
									setSelectedAddress('');
									onChange('');
								}}
							>
								<OutlineCloseIcon className='text-primary h-2 w-2' />
							</button>
						</div>
					) : (
						<AutoComplete
							filterOption
							defaultOpen
							options={autocompleteAddresses}
							id='sender'
							placeholder={placeholder || 'Select Address'}
							onChange={(value) => {
								setSelectedAddress(value);
								onChange(value);
							}}
						/>
					)}
				</div>
			</Form.Item>
		</div>
	);
};

export default AddressInput;
