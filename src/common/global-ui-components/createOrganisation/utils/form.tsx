import Input from '@common/global-ui-components/Input';

export const organisationDetailsFormFields = [
	{
		label: 'Name',
		name: 'name',
		type: 'text',
		required: true,
		placeholder: 'Add a name',
		rules: [
			{
				required: true,
				message: 'Please input the organisation name!'
			}
		],
		input: <Input placeholder='Add a name' />
	},
	{
		label: 'Description',
		name: 'description',
		type: 'text',
		placeholder: 'Add a description to your organisation',
		input: <Input placeholder='Add a description to your organisation' />
	}
];
