// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal as AntDModal } from 'antd';
import { ReactNode } from 'react';

import { OutlineCloseIcon } from './CustomIcons';

export interface IModal {
	open: boolean;
	title: ReactNode;
	children?: React.ReactElement;
}

interface IModalProps extends IModal {
	onCancel: () => void;
}

const ModalComponent = ({ open, children, title, onCancel }: IModalProps) => {
	return (
		<AntDModal
			centered
			footer={false}
			closeIcon={
				<button
					className='bg-highlight flex h-6 w-6 items-center justify-center rounded-full border-none outline-none'
					onClick={() => onCancel()}
				>
					<OutlineCloseIcon className='text-primary h-2 w-2' />
				</button>
			}
			title={<h3 className='mb-8 text-lg font-semibold text-white'>{title}</h3>}
			open={open}
			className='w-auto scale-90 origin-center md:min-w-[500px]'
			destroyOnClose
		>
			{children}
		</AntDModal>
	);
};

export default ModalComponent;
