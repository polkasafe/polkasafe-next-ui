import Image from 'next/image';
import React from 'react';
import noMessage from '@common/assets/no-message.png';

const NoMessages = () => {
	return (
		<div className='flex flex-col gap-y-2 h-full w-full justify-center items-center'>
			<Image
				className='bg-transparent'
				src={noMessage}
				height={150}
				width={150}
				alt='No messages'
			/>
			<span className='text-sm text-text_placeholder'>No Messages</span>
		</div>
	);
};

export default NoMessages;
