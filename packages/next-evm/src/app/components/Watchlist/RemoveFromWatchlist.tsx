import React, { useState } from 'react';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { NotificationStatus } from '@next-common/types';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';
import { useWallets } from '@privy-io/react-auth';
import RemoveBtn from '../Settings/RemoveBtn';
import CancelBtn from '../Settings/CancelBtn';

const RemoveFromWatchlist = ({
	name,
	address,
	network,
	onCancel
}: {
	address: string;
	name: string;
	network: string;
	onCancel: () => void;
}) => {
	const { setUserDetailsContextState, watchlists } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState(false);

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const removeAddress = async () => {
		if (!address || !network) return;

		setLoading(true);
		const watchlistRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/removeFromWatchlist`, {
			body: JSON.stringify({
				address,
				network
			}),
			headers: firebaseFunctionsHeader(connectedWallet.address),
			method: 'POST'
		});
		const { data: watchlistData, error: watchlistError } = (await watchlistRes.json()) as {
			data: string;
			error: string;
		};

		if (watchlistData && !watchlistError) {
			setLoading(false);
			const copyWatchlists = { ...watchlists };
			delete copyWatchlists[`${address}_${network}`];
			setUserDetailsContextState((prev) => ({
				...prev,
				watchlists: copyWatchlists
			}));
			queueNotification({
				header: 'Success',
				message: 'Address Removed from Watchlist',
				status: NotificationStatus.SUCCESS
			});
			onCancel();
			return;
		}

		if (watchlistError) {
			setLoading(false);
			queueNotification({
				header: 'Failed',
				message: 'Failed to Remove Address From Watchlist',
				status: NotificationStatus.ERROR
			});
		}
	};
	return (
		<div className='w-[560px]'>
			<p className='text-white font-medium text-sm leading-[15px]'>
				Are you sure you want to delete
				<span className='text-primary mx-1.5'>{name}</span>
				from your Watchlist?
			</p>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn
					loading={loading}
					onClick={onCancel}
				/>
				<RemoveBtn
					loading={loading}
					onClick={removeAddress}
				/>
			</div>
		</div>
	);
};

export default RemoveFromWatchlist;
