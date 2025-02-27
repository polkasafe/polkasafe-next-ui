// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Select } from 'antd';

const currencies = [
	{
		label: 'USD',
		value: 'USD'
	},
	{
		label: 'GBP',
		value: 'GBP'
	},
	{
		label: 'EUR',
		value: 'EUR'
	},
	{
		label: 'CHF',
		value: 'CHF'
	},
	{
		label: 'AED',
		value: 'AED'
	},
	{
		label: 'JPY',
		value: 'JPY'
	},
	{
		label: 'AUD',
		value: 'AUD'
	},
	{
		label: 'CAD',
		value: 'CAD'
	},
	{
		label: 'INR',
		value: 'INR'
	}
];
export default function CurrencyDropdown({
	label = true,
	onChange
}: {
	label?: boolean;
	onChange?: (value: string) => void;
}) {
	return (
		<div className='flex p-3 justify-center items-center'>
			{label ? 'Currency:' : ''} &nbsp;
			<Select
				size='small'
				className='w-24'
				options={currencies}
				defaultValue={'USD'}
				onChange={(value) => onChange && onChange(value)}
			/>
		</div>
	);
}
