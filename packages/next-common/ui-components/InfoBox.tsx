import React from 'react';
import { WarningCircleIcon } from './CustomIcons';

const InfoBox = ({ message }: { message: string }) => {
	return (
		<section className='mb-4 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
			<WarningCircleIcon />
			<p>{message}</p>
		</section>
	);
};

export default InfoBox;
