// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon: any;
	disabled?: boolean;
	className?: string;
}

const WalletButton: React.FC<Props> = ({ disabled, onClick, icon, className }: Props) => {
	return (
		<Button
			className={`bg-bg-secondary h-10 w-10 p-2 ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{icon}
		</Button>
	);
};

export default WalletButton;
