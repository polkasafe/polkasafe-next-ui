import React from 'react';
import TreasurEaseLogo from '@next-common/assets/TreasurEase-logo.svg';

const SplashScreen = () => {
	return (
		<div className='h-screen w-full flex justify-center items-center bg-bg-main'>
			<div className='h-[30px] w-[180px]'>
				<TreasurEaseLogo />
			</div>
		</div>
	);
};

export default SplashScreen;
