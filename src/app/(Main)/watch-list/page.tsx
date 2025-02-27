import { WatchListTable } from '@substrate/app/(Main)/watch-list/components/WatchListTable';
import { LOGIN_URL } from '@substrate/app/global/end-points';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { redirect } from 'next/navigation';
import React from 'react';

function WatchList() {
	const user = getUserFromCookie();
	if (!user) {
		redirect(LOGIN_URL);
	}
	return (
		<div className='bg-bg-main rounded-3xl p-5 h-full'>
			<WatchListTable />
		</div>
	);
}

export default WatchList;
