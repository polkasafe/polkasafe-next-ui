// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	children: ReactNode;
	onClick: () => void;
}

const SecondaryButton = ({ className, children, onClick }: Props) => {
	return (
		// TODO: Implement transition for bg and text color
		<button
			className={`${className} text-md bg-purple_secondary bg-tertiary hover:bg-primary text-primary shadow-secondary rounded-lg px-2 py-3 font-bold hover:text-white`}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default SecondaryButton;
