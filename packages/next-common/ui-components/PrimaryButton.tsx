// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
	onClick?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	size?: SizeType;
	loading?: boolean;
	disabled?: boolean;
	icon?: ReactNode;
	secondary?: boolean;
}

const PrimaryButton = ({ className, children, onClick, size, loading, disabled, icon, secondary }: Props) => {
	return (
		<Button
			icon={icon}
			disabled={disabled}
			size={size}
			loading={loading}
			className={`flex items-center text-xs shadow-md p-2 outline-none md:font-bold ${className} ${
				disabled
					? 'bg-highlight text-text_secondary border-none'
					: secondary
					? 'bg-highlight text-primary border border-primary'
					: 'bg-primary text-white border-none'
			}`}
			onClick={(e) => onClick?.(e)}
		>
			{children}
		</Button>
	);
};

export default PrimaryButton;
