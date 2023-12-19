import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import React from 'react';
import NoAddressesFound from './NoAddressesFound';
import AddressList from './AddressList';
import AddWatchlistAddress from './AddWatchlistAddress';

const Watchlist = () => {
	const { watchlists } = useGlobalUserDetailsContext();
	return (
		<div>
			{watchlists && Object.keys(watchlists).length > 0 ? (
				<div className='flex flex-col gap-y-5'>
					<AddWatchlistAddress />
					<AddressList />
				</div>
			) : (
				<NoAddressesFound />
			)}
		</div>
	);
};

export default Watchlist;
