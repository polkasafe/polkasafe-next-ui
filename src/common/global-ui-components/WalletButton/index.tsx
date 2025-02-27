// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Tooltip } from 'antd';
import { twMerge } from 'tailwind-merge';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon: any;
	disabled?: boolean;
	tooltip?: string;
	className?: string;
}

const WalletButton: React.FC<Props> = ({ disabled, onClick, icon, className, tooltip }: Props) => {
	return (
		<Tooltip
			title={tooltip && <span className='text-white font-medium'>{tooltip}</span>}
			className='bg-[#24272E]'
		>
			<Button
				className={twMerge('bg-bg-secondary h-10 w-10 p-2', className)}
				onClick={onClick}
				disabled={disabled}
			>
				{icon}
			</Button>
		</Tooltip>
	);
};

export default WalletButton;
