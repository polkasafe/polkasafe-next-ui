// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Lottie from 'react-lottie-player';

import LoadingScreen from './lottie-files/loading-animation.json';

interface Props {
	message?: string;
	width?: number;
	noWaitMessage?: boolean;
}

const LoadingLottie: React.FC<Props> = ({ message, width = 350, noWaitMessage = false }: Props) => {
	return (
		<div className='relative flex w-full flex-col items-center justify-center'>
			<Lottie
				animationData={LoadingScreen}
				style={{
					height: width,
					width
				}}
				play
			/>
			<div
				style={{ bottom: '40px' }}
				className='absolute w-full text-center text-lg font-medium text-white'
			>
				{message || 'Waiting to create your transaction'}
			</div>
			{!noWaitMessage && (
				<div className='text-text_secondary text-sm'>This might take a few seconds. So, sit back and relax...</div>
			)}
		</div>
	);
};

export default LoadingLottie;
