// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import Image from 'next/image';
import React from 'react';

interface Props {
	onClick: React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>;
	icon: string;
	disabled: boolean;
	className?: string;
}

const WalletButton = ({ disabled, onClick, icon, className }: Props) => {
	return (
		<Button
			className={`bg-bg-secondary flex items-center justify-center rounded-md px-7 py-4 outline-none ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			<Image
				src={icon}
				alt='parachain icon'
				height={20}
				width={20}
			/>
		</Button>
	);
};

export default WalletButton;
