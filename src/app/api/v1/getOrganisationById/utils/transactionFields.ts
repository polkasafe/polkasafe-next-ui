import { EFieldType } from '@common/types/substrate';

export const transactionFields = {
	expense_reimbursement: {
		fieldDesc: '',
		fieldName: 'Expense Reimbursement',
		subfields: {
			department: {
				subfieldName: 'Department',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Engineering'
					},
					{
						optionName: 'Finance'
					},
					{
						optionName: 'Marketing'
					},
					{
						optionName: 'Operations'
					},
					{
						optionName: 'Legal'
					},
					{
						optionName: 'Content'
					},
					{
						optionName: 'Other'
					}
				]
			},
			project: {
				subfieldName: 'Project',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			description: {
				subfieldName: 'Description',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			expense_type: {
				subfieldName: 'Expense Type',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Legal'
					},
					{
						optionName: 'Gas Fees'
					},
					{
						optionName: 'Events'
					},
					{
						optionName: 'Other'
					},
					{
						optionName: 'Software'
					}
				]
			},
			invoice: {
				subfieldName: 'Invoice',
				subfieldType: EFieldType.TEXT,
				required: true
			}
		}
	},
	contributor_compensation: {
		fieldName: 'Contributor Compensation',
		fieldDesc: '',
		subfields: {
			department: {
				subfieldName: 'Department',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Engineering'
					},
					{
						optionName: 'Finance'
					},
					{
						optionName: 'Marketing'
					},
					{
						optionName: 'Operations'
					},
					{
						optionName: 'Legal'
					},
					{
						optionName: 'Content'
					},
					{
						optionName: 'Other'
					}
				]
			},
			project: {
				subfieldName: 'Project',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			description: {
				subfieldName: 'Description',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			compensation_type: {
				subfieldName: 'Compensation Type',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Bounty'
					},
					{
						optionName: 'Contractor'
					},
					{
						optionName: 'Full-Time'
					},
					{
						optionName: 'Part-Time'
					}
				]
			},
			invoice: {
				subfieldName: 'Invoice',
				subfieldType: EFieldType.TEXT,
				required: true
			}
		}
	},
	grants: {
		fieldName: 'Grants',
		fieldDesc: '',
		subfields: {
			department: {
				subfieldName: 'Department',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Engineering'
					},
					{
						optionName: 'Finance'
					},
					{
						optionName: 'Marketing'
					},
					{
						optionName: 'Operations'
					},
					{
						optionName: 'Legal'
					},
					{
						optionName: 'Content'
					},
					{
						optionName: 'Other'
					}
				]
			},
			project: {
				subfieldName: 'Project',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			description: {
				subfieldName: 'Description',
				subfieldType: EFieldType.TEXT,
				required: true
			}
		}
	},
	airdrop: {
		fieldName: 'Airdrop',
		fieldDesc: '',
		subfields: {
			department: {
				subfieldName: 'Department',
				subfieldType: EFieldType.SINGLE_SELECT,
				required: true,
				dropdownOptions: [
					{
						optionName: 'Engineering'
					},
					{
						optionName: 'Finance'
					},
					{
						optionName: 'Marketing'
					},
					{
						optionName: 'Operations'
					},
					{
						optionName: 'Legal'
					},
					{
						optionName: 'Content'
					},
					{
						optionName: 'Other'
					}
				]
			},
			project: {
				subfieldName: 'Project',
				subfieldType: EFieldType.TEXT,
				required: true
			},
			description: {
				subfieldName: 'Description',
				subfieldType: EFieldType.TEXT,
				required: true
			}
		}
	},
	none: {
		fieldDesc: 'N/A',
		fieldName: 'Other',
		subfields: {}
	}
};
