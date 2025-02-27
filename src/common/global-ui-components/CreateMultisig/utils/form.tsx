/* eslint-disable no-tabs */
import Input from '@common/global-ui-components/Input';

export const createMultisigFormFields = [
	{
		label: 'Name',
		name: 'name',
		type: 'text',
		required: true,
		placeholder: 'Give the MultiSig a unique name',
		rules: [
			{
				required: true,
				message: 'Please input the name!'
			}
		],
		input: <Input placeholder='Give the MultiSig a unique name' />
	}
	// {
	// 	label: 'Threshold',
	// 	name: 'threshold',
	// 	type: 'number',
	// 	required: true,
	// 	placeholder: 'Enter the threshold',
	// 	rules: [
	// 		{
	// 			required: true,
	// 			message: 'Please input the threshold!'
	// 		}
	// 	],
	// 	input: <Input placeholder='2' />
	// }
];
