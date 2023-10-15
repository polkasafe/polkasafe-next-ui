// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import React, { ReactNode } from 'react';

import { CloseIcon } from './CustomIcons';

interface IModalProps {
	isOpen: boolean;
	handleCancel: () => void;
	handleOk: () => void;
	title?: string;
	children: ReactNode;
}

const CustomModal: React.FC<IModalProps> = ({ isOpen, handleCancel, handleOk, title, children }) => {
	return (
		<Modal
			className='w-[40vw] bg-transparent'
			closeIcon={<CloseIcon className='w-3' />}
			footer={null}
			title={<span className='mx-3 my-5 text-xl text-white'>{title}</span>}
			open={isOpen}
			onOk={handleOk}
			onCancel={handleCancel}
		>
			<div>{children}</div>
		</Modal>
	);
};

export default CustomModal;
