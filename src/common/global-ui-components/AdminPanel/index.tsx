import { CheckCircleOutlined } from '@ant-design/icons';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';

export const AdminPanel = () => {
	return (
		<section className='mt-4 bg-bg-secondary rounded-lg p-4 flex items-start justify-start'>
			<div className='flex justify-start items-center gap-x-2 w-[30%]'>
				<CheckCircleOutlined />
				<Typography
					variant={ETypographyVariants.p}
					className='m-0 p-0 text-text-secondary text-sm'
				>
					Two-Factor Authentication
				</Typography>
			</div>
			<div className='flex flex-col items-start gap-x-2'>
				<p className='m-0 p-0 text-text-secondary text-sm whitespace-nowrap'>
					Enhance account security with two factor authentication. Verify you identity with an extra step for added
					protection
				</p>
				<Button
					htmlType='submit'
					icon={<CheckCircleOutlined />}
					variant={EButtonVariant.PRIMARY}
					onClick={() => {}}
					className='p-0 m-0 bg-transparent text-primary border-none shadow-none text-sm flex items-center justify-start w-[250px]'
					fullWidth
				>
					Two-Factor Authentication
				</Button>
			</div>
		</section>
	);
};
