import React from 'react';
import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';

const SplashScreen = () => {
	return (
		<div className='h-screen w-full flex justify-center items-center bg-bg-main'>
			<div className='h-[30px] w-[180px]'>
				<PolkasafeLogo />
			</div>
		</div>
	);
};

export default SplashScreen;
