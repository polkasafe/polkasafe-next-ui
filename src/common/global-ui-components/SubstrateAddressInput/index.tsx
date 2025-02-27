// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Address from '@common/global-ui-components/Address';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { AutoComplete, Form } from 'antd';
import { useState } from 'react';

interface IAddressInput {
	onChange: (address: string) => void;
	placeholder?: string;
}

const SubstrateAddressInput: React.FC<IAddressInput> = ({ onChange, placeholder }: IAddressInput) => {
	const [selectedAddress, setSelectedAddress] = useState<string>('');
	return (
		<div className='w-full'>
			<Form.Item
				name='sender'
				rules={[{ required: true }]}
				className='my-0 border-0 p-0 outline-0'
			>
				<div className='flex items-center'>
					{selectedAddress && getSubstrateAddress(selectedAddress) ? (
						<div className='border-primary flex h-full w-full items-center justify-between rounded-lg border border-solid p-2'>
							<Address address={selectedAddress} />
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
							options={[]}
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

export default SubstrateAddressInput;
