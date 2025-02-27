const FormFields = [
	{
		label: 'Recipient',
		name: 'recipient',
		type: 'text',
		placeholder: 'Enter recipient address',
		required: true
	},
	{
		label: 'Amount',
		name: 'amount',
		type: 'number',
		placeholder: 'Enter amount',
		required: true
	},
	{
		label: 'Asset',
		name: 'asset',
		type: 'text',
		placeholder: 'Enter asset',
		required: true
	},
	{
		label: 'Message',
		name: 'message',
		type: 'textarea',
		placeholder: 'Enter message',
		required: false
	}
];

function SendFunds() {
	return (
		<div>
			{FormFields.map((field) => (
				<div key={field.name}>
					<label htmlFor={field.name}>{field.label}</label>
					<input
						type={field.type}
						name={field.name}
						placeholder={field.placeholder}
						required={field.required}
					/>
				</div>
			))}
		</div>
	);
}

export default SendFunds;
