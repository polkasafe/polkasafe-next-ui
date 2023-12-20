import React from 'react';

import NoWatchlistSVG from '@next-common/assets/no-watchlist-address.svg';
import AddWatchlistAddress from './AddWatchlistAddress';

const NoAddressesFound = () => {
	return (
		<div className='flex justify-center gap-x-4 items-center mb-6 w-full'>
			<div className='flex flex-col text-white items-center justify-center gap-y-3'>
				<NoWatchlistSVG />
				<p className='text-text_secondary'>No watchlisted addresses</p>
				<p className='text-text_secondary mt-5'>Enter an address and add it to the watchlist</p>
				<AddWatchlistAddress className='mt-3' />
			</div>
		</div>
	);
};

export default NoAddressesFound;
