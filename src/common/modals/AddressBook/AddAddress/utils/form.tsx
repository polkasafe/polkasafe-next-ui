import Input from '@common/global-ui-components/Input';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';

export const addAddressFormFields = [
	{
		label: 'Name',
		name: 'name',
		type: 'text',
		required: true,
		placeholder: 'Add Name',
		rules: [
			{
				required: true,
				message: 'Please input the name!'
			}
		],
		input: <Input />
	},
	{
		label: 'Address',
		name: 'address',
		type: 'text',
		required: true,
		placeholder: 'Enter address',
		rules: [
			{
				required: true,
				message: 'Please input the address!'
			},
			() => ({
				validator(_: any, value: string) {
					if (getSubstrateAddress(value) === null) {
						return Promise.reject(new Error('Enter a valid address'));
					}
					return Promise.resolve();
				}
			})
		],
		input: <Input />
	},
	{
		label: 'Email',
		name: 'email',
		type: 'email',
		required: false,
		placeholder: 'Enter email',
		input: <Input />
	},
	// discord
	{
		label: 'Discord',
		name: 'discord',
		type: 'text',
		required: false,
		placeholder: 'Enter discord',
		input: <Input />
	},
	// telegram
	{
		label: 'Telegram',
		name: 'telegram',
		type: 'text',
		required: false,
		placeholder: 'Enter telegram',
		input: <Input />
	}
];
