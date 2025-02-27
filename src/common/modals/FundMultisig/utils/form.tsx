import Input from '@common/global-ui-components/Input';

export const fundFormFields = [
	{
		label: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		placeholder: 'Enter amount',
		rules: [
			{
				required: true,
				message: 'Please input the amount!'
			}
		],
		input: <Input />
	}
];
