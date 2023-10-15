// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import React from 'react';
import FailedTransactionLottie from '@next-common/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from '@next-common/assets/lottie-graphics/SuccessTransaction';

import { OutlineCloseIcon } from './CustomIcons';

interface ILoadingModal {
	loading: boolean;
	success?: boolean;
	open: boolean;
	onCancel: () => void;
	message?: string;
}

const LoadingModal = ({ loading, success, open, onCancel, message }: ILoadingModal) => {
	return (
		<Modal
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
			open={open}
			className='text-primary w-auto scale-90 md:min-w-[500px]'
		>
			{loading ? (
				<LoadingLottie message={message} />
			) : success ? (
				<SuccessTransactionLottie message='Successful!' />
			) : (
				<FailedTransactionLottie message='Failed!' />
			)}
		</Modal>
	);
};

export default LoadingModal;
