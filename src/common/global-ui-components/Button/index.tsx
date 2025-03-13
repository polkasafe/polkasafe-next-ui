/* eslint-disable react/jsx-props-no-spreading */

import { Button as AntDButton, ButtonProps } from 'antd';
import { twMerge } from 'tailwind-merge';
import { ScaleMotion } from '@common/global-ui-components/Motion/Scale';

export enum EButtonVariant {
	PRIMARY = 'primary',
	SECONDARY = 'secondary',
	DANGER = 'danger'
}

interface IButtonProps extends ButtonProps {
	fullWidth?: boolean;
	variant?: EButtonVariant;
	className?: string;
}

export default function Button({ variant, className, fullWidth, children, ...props }: IButtonProps) {
	switch (variant) {
		case EButtonVariant.PRIMARY:
			return (
				<ScaleMotion>
					<AntDButton
						size='large'
						className={twMerge(
							'bg-primary text-white rounded-lg border-none min-w-[120px] flex justify-center items-center gap-x-2 text-sm shadow-none',
							props.disabled && 'opacity-60 text-disabled-btn-text',
							fullWidth && 'w-full',
							className
						)}
						{...props}
					>
						{children}
					</AntDButton>
				</ScaleMotion>
			);
		case EButtonVariant.SECONDARY:
			return (
				<ScaleMotion>
					<AntDButton
						size='large'
						className={twMerge(
							'bg-highlight text-white rounded-lg min-w-[120px] flex justify-center items-center gap-x-2 text-sm shadow-none text-label border-none',
							props.disabled && 'opacity-60 text-text-disabled',
							fullWidth && 'w-full',
							className
						)}
						{...props}
					>
						{children}
					</AntDButton>
				</ScaleMotion>
			);
		case EButtonVariant.DANGER:
			return (
				<ScaleMotion>
					<AntDButton
						size='large'
						className={twMerge(
							'flex items-center text-failure text-sm font-normal bg-[#e63946]/[0.1] border-none outline-none rounded-lg justify-center shadow-none',
							fullWidth && 'w-full',
							className
						)}
						{...props}
					>
						{children}
					</AntDButton>
				</ScaleMotion>
			);
		default:
			return (
				<ScaleMotion>
					<AntDButton
						className={twMerge(
							'bg-bg-secondary text-text-primary border-primary rounded-lg shadow-none',
							fullWidth && 'w-full',
							className
						)}
						{...props}
					>
						{children}
					</AntDButton>
				</ScaleMotion>
			);
	}
}
