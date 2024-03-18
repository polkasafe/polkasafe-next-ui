import React from 'react';

const SafeApps = () => {
	const appUrl = 'https://jumper.exchange/';

	return (
		<div className='h-full'>
			<iframe
				className='w-full h-full'
				id={`iframe-${appUrl}`}
				src={appUrl}
				title='Jumper'
			/>
		</div>
	);
};

export default SafeApps;
