import Input from '@common/global-ui-components/Input';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';

export const watchlistFormFields = [
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
	}
];
