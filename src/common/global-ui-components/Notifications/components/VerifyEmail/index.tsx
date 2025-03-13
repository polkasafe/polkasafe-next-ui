import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Input from '@common/global-ui-components/Input';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { MailIcon } from '@common/global-ui-components/Icons';
import { Form } from 'antd';
import { useNotification } from '@common/utils/notification';
import { ERROR_MESSAGES } from '@common/utils/messages';
import { verifyEmail } from '@sdk/polkasafe-sdk/src/verify-email';
import { useState } from 'react';

export const VerifyEmail = ({ address, signature }: { address: string; signature: string }) => {
	const [loading, setLoading] = useState(false);
	const notification = useNotification();

	const handleVerify = async (value: { email: string }) => {
		try {
			const { email } = value;
			if (!email) {
				notification(ERROR_MESSAGES.INVALID_EMAIL);
				return;
			}
			setLoading(true);
			const data = await verifyEmail({ address, signature, email });
			if (!data) {
				notification(ERROR_MESSAGES.ERROR_IN_SENDING_EMAIL);
				return;
			}
		} catch (error) {
			notification({ ...ERROR_MESSAGES.ERROR_IN_SENDING_EMAIL, description: error.message });
		} finally {
			setLoading(false);
		}

		console.log('Verify email', value);
	};
	return (
		<article className='bg-bg-secondary rounded-lg px-4 py-2 flex items-center justify-start gap-x-8'>
			<Typography
				variant={ETypographyVariants.p}
				className='bg-transparent text-text-secondary flex items-center justify-start basis-1/4 pt-0 gap-2'
			>
				<MailIcon /> Email Notifications
			</Typography>
			<Form onFinish={handleVerify}>
				<div className='flex gap-x-2'>
					<div className='w-80'>
						<Form.Item
							name='email'
							className='m-0'
						>
							<Input
								placeholder='Enter email'
								className='border-2 p-1.5 px-3'
							/>
						</Form.Item>
					</div>
					<Button
						htmlType='submit'
						variant={EButtonVariant.PRIMARY}
						className='p-4 min-w-0'
						size='small'
						loading={loading}
					>
						Verify
					</Button>
				</div>
			</Form>
		</article>
	);
};
