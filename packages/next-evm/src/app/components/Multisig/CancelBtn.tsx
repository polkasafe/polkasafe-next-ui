// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC } from 'react';
import { OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import { Button } from 'antd';

interface ICancelBtnProps {
	onClick?: () => void;
	className?: string;
	title?: string;
	loading?: boolean;
}

const CancelBtn: FC<ICancelBtnProps> = ({ onClick, className, title, loading }) => {
	return (
		<Button
			disabled={loading}
			size='large'
			className={classNames(
				'flex items-center gap-x-[10.83px] text-failure text-sm font-normal leading-[15px] bg-failure bg-opacity-10 border-none outline-none rounded-lg min-w-[120px] justify-center',
				className
			)}
			onClick={onClick}
		>
			<span className='flex items-center justify-center p-2 border border-failure rounded-full w-[14.33px] h-[14.33px]'>
				<OutlineCloseIcon className='w-[5px] h-[5px]' />
			</span>
			<span>{title || 'Cancel'}</span>
		</Button>
	);
};

export default CancelBtn;
