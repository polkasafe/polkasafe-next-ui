import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { addAddressFormFields } from '@common/modals/AddressBook/AddAddress/utils/form';
import { IAddressBook } from '@common/types/substrate';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { Form, Spin } from 'antd';
import { useState } from 'react';
import { useNotification } from '@common/utils/notification';
import LoadingLottie from '@common/global-ui-components/LottieAnimations/LoadingLottie';

export const AddAddressForm = ({
	initialValue,
	onSubmit
}: {
	initialValue: IAddressBook;
	onSubmit: (value: IAddressBook) => Promise<void>;
}) => {
	const [loading, setLoading] = useState(false);
	const notification = useNotification();
	const handleSubmit = async (values: IAddressBook) => {
		try {
			const { address, name, email, discord, telegram } = values;
			if (!address || !name) {
				return;
			}

			const payload = {
				address,
				name,
				email: email === '-' ? '' : email,
				discord: discord === '-' ? '' : discord,
				telegram: telegram === '-' ? '' : telegram
			};
			setLoading(true);
			await onSubmit(payload);
			notification(SUCCESS_MESSAGES.ADD_ADDRESS_SUCCESS);
		} catch (error) {
			notification({ ...ERROR_MESSAGES.ADD_ADDRESS_FAILED, description: error || error.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<Spin
			spinning={loading}
			indicator={
				<LoadingLottie
					width={200}
					message='Adding Address to Address Book'
				/>
			}
		>
			<Form
				initialValues={initialValue}
				layout='vertical'
				onFinish={handleSubmit}
			>
				{addAddressFormFields.map((field) => {
					return (
						<Form.Item
							key={field.name}
							name={field.name}
							label={field.label}
							rules={field.rules}
							required={field.required}
						>
							{field.input}
						</Form.Item>
					);
				})}
				<Button
					variant={EButtonVariant.PRIMARY}
					fullWidth
					htmlType='submit'
				>
					Submit
				</Button>
			</Form>
		</Spin>
	);
};
