import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import { ReactNode } from 'react';

interface IActionButton {
	label: string;
	disabled: boolean;
	loading?: boolean;
	onClick?: () => void;
	onCancel?: () => void;
	cancelLabel?: string;
	icon?: ReactNode;
}

export function ActionButtons({
	icon,
	label,
	disabled,
	loading,
	onClick,
	onCancel,
	cancelLabel = 'Cancel'
}: IActionButton) {
	return (
		<div className='w-full flex gap-2 flex-row-reverse'>
			<div className='w-full'>
				<Button
					htmlType='submit'
					variant={EButtonVariant.PRIMARY}
					disabled={disabled}
					size='large'
					fullWidth
					loading={Boolean(loading)}
					icon={icon}
					// eslint-disable-next-line react/jsx-props-no-spreading
					{...(onClick && { onClick })}
				>
					{label}
				</Button>
			</div>
			<div className='w-full'>
				<Button
					variant={EButtonVariant.DANGER}
					disabled={loading}
					size='large'
					fullWidth
					loading={Boolean(loading)}
					icon={<OutlineCloseIcon className='text-failure' />}
					// eslint-disable-next-line react/jsx-props-no-spreading
					{...(onCancel && { onClick: onCancel })}
				>
					{cancelLabel}
				</Button>
			</div>
		</div>
	);
}
