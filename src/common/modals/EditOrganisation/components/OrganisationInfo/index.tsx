import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Input from '@common/global-ui-components/Input';
import { ICreateOrganisationDetails, IOrganisation } from '@common/types/substrate';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { Form, Spin } from 'antd';
import { useState } from 'react';


export const OrganisationInfo = ({ onSubmit, isEdit, organisation, onChange }: { onSubmit: (value: ICreateOrganisationDetails) => void, onChange?: (value: ICreateOrganisationDetails) => void, isEdit?: boolean, organisation: IOrganisation }) => {
	const organisationForm = [
		{
			label: 'Organisation Name',
			name: 'name',
			type: 'text',
			required: true,
			initialValue: organisation.name
		},
		{
			label: 'Full Name',
			name: 'fullName',
			type: 'text',
			required: true,
			initialValue: ''
		},
		{
			label: 'Address',
			name: 'address',
			type: 'text',
			initialValue: organisation.address
		},
		{
			label: 'City',
			name: 'city',
			type: 'text',
			initialValue: organisation.city
		},
		{
			label: 'State',
			name: 'state',
			type: 'text',
			initialValue: organisation.state
		},
		{
			label: 'Postal Code',
			name: 'postalCode',
			type: 'text',
			initialValue: organisation.postalCode
		},
		{
			label: 'Country',
			name: 'country',
			type: 'text',
			initialValue: organisation.country
		},
		{
			label: 'Tax Number',
			name: 'taxNumber',
			type: 'text',
			initialValue: organisation.taxNumber
		}
	];
	const [loading, setLoading] = useState(false);
	const notification = useNotification();

	const handleFinish = (value: any) => {
		try {
			setLoading(true);
			console.log(value);
			onSubmit(value);
			notification(SUCCESS_MESSAGES.UPDATE_MULTISIG_SUCCESS);
		} catch (error) {
			notification(ERROR_MESSAGES.UPDATE_MULTISIG_FAILED);
		} finally {
			setLoading(false);
		}
	};
	return (
		<Spin
			className='p-4'
			spinning={loading}
		>
			<Form
				layout='vertical'
				onFinish={handleFinish}
				onValuesChange={(changedValues, allValues) => onChange?.(allValues)}
			>
				{organisationForm.map((field) => (
					<Form.Item
						label={field.label}
						name={field.name}
						initialValue={field.initialValue}
						rules={[{ required: field.required, message: `Please input your ${field.label}` }]}
						key={field.name}
						className='m-2'
					>
						<Input className='bg-bg-main' />
					</Form.Item>
				))}
				{!isEdit && 
					<div className='pr-1'>
						<Button
							variant={EButtonVariant.PRIMARY}
							htmlType='submit'
							fullWidth
						>
							Submit
						</Button>
					</div>
				}
			</Form>
		</Spin>
	);
};
