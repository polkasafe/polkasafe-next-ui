// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Lottie from 'react-lottie-player';

import FailedScreen from '@assets/lottie-files/failed-animation.json';

interface Props {
	message?: string;
	width?: number;
	waitMessage?: string;
	className?: string;
}

const FailedTransactionLottie: React.FC<Props> = ({ message, width = 350, waitMessage, className }: Props) => {
	return (
		<div className={`flex w-full flex-col items-center justify-center ${className}`}>
			<Lottie
				animationData={FailedScreen}
				style={{
					width
				}}
				play
			/>
			<div className='text-failure mb-1 text-lg font-medium'>{message}</div>
			<div className='text-text-secondary max-w-[452px]'>{waitMessage}</div>
		</div>
	);
};

export default FailedTransactionLottie;
