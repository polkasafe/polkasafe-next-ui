/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactNode } from 'react';
import { Dropdown as AntdDropdown, DropdownProps } from 'antd';

interface IDropdownProps extends DropdownProps {
	children: ReactNode;
}

function Dropdown({ children, ...props }: IDropdownProps) {
	return (
		<AntdDropdown
			trigger={['click']}
			className='border border-primary rounded-lg p-1.5 bg-bg-secondary cursor-pointer min-w-[150px]'
			{...props}
		>
			{children}
		</AntdDropdown>
	);
}

export { Dropdown };
