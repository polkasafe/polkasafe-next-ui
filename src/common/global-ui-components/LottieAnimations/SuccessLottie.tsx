// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Lottie from 'react-lottie-player';

import SuccessScreen from '@assets/lottie-files/success-animation.json';

interface Props {
	message?: string;
	width?: number;
	waitMessage?: string;
}

const SuccessTransactionLottie: React.FC<Props> = ({ message, width = 350, waitMessage }: Props) => {
	return (
		<div className='flex w-full flex-col items-center justify-center'>
			<Lottie
				animationData={SuccessScreen}
				style={{
					width
				}}
				play
			/>
			<div className='text-success mb-1 text-lg font-medium'>{message}</div>
			<div className='text-text-secondary max-w-[452px]'>{waitMessage}</div>
		</div>
	);
};

export default SuccessTransactionLottie;
