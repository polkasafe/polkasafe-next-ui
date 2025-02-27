import Button, { EButtonVariant } from '@common/global-ui-components/Button';

interface IActionButton {
	label: string;
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
}

function ActionButton({ label, disabled, loading, onClick }: IActionButton) {
	return (
		<div className='w-full'>
			<Button
				htmlType='submit'
				variant={EButtonVariant.PRIMARY}
				className='bg-primary border-primary text-sm'
				disabled={disabled}
				fullWidth
				loading={Boolean(loading)}
				onClick={onClick}
			>
				{label}
			</Button>
		</div>
	);
}

export default ActionButton;
