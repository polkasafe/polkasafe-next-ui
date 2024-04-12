// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';
import { OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';

interface ICancelBtnProps {
	onClick?: () => void;
}
interface ICancelBtnProps {
	className?: string;
	onClick?: () => void;
	title?: string;
	loading?: boolean;
	disabled?: boolean;
	icon?: ReactNode;
}

const CancelBtn: FC<ICancelBtnProps> = ({ className, onClick, title, loading, disabled, icon }) => {
	return (
		// TODO: use ant-d component and use loading instead of disabled
		<Button
			disabled={disabled}
			icon={
				icon || (
					<span className='flex items-center justify-center p-2 border border-failure rounded-full w-[14.33px] h-[14.33px]'>
						<OutlineCloseIcon className='w-[5px] h-[5px]' />
					</span>
				)
			}
			loading={loading}
			size='large'
			className={classNames(
				'flex items-center text-failure text-sm font-normal leading-[15px] bg-failure bg-opacity-10 border-none outline-none rounded-lg min-w-[120px] justify-center',
				className
			)}
			onClick={onClick}
		>
			<span>{title || 'Cancel'}</span>
		</Button>
	);
};

export default CancelBtn;
