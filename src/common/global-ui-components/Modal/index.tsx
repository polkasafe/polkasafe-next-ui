// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { OutlineCloseIcon } from '@common/global-ui-components/Icons';
import { Modal as AntDModal } from 'antd';
import { PropsWithChildren, ReactNode } from 'react';

export interface IModal {
	open: boolean;
	title: ReactNode;
	loading?: boolean;
}

interface IModalProps extends IModal {
	onCancel: () => void;
}

const Modal = ({ open, children, title, onCancel, loading = false }: PropsWithChildren<IModalProps>) => {
	return (
		<AntDModal
			loading={loading}
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
			className='w-auto origin-center md:min-w-[500px]'
			destroyOnClose
		>
			{children}
		</AntDModal>
	);
};

export default Modal;
