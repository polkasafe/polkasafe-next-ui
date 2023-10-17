// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import NoNotification from '@next-common/assets/icons/no-notification.svg';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { INotification } from '@next-common/types';
import { NotificationIcon } from '@next-common/ui-components/CustomIcons';
import Loader from '@next-common/ui-components/Loader';

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import NotificationCard from './NotificationCard';

const Notification = () => {
	const { network } = useGlobalApiContext();
	const { address, setUserDetailsContextState, notifiedTill } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState<INotification[]>([]);
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);
	const unreadNotificationAvailable = !notifications.length
		? undefined
		: notifications.filter(({ created_at }) => !(notifiedTill && dayjs(notifiedTill).isAfter(created_at)));

	const getNotifications = useCallback(async () => {
		if (!address) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<INotification[]>(
			`${SUBSTRATE_API_URL}/getNotifications`,
			{},
			{ network }
		);

		if (error) {
			console.log('Error in Fetching notifications: ', error);
		}
		if (data) {
			setNotifications(data as INotification[]);
		}
		setLoading(false);
	}, [address, network]);

	const markAllRead = useCallback(async () => {
		const newNotifiedTill = new Date();
		localStorage.setItem('notifiedTill', newNotifiedTill.toISOString());
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				notifiedTill: newNotifiedTill
			};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!address) return;
		getNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div
			className='relative'
			onBlur={() => {
				if (!isMouseEnter.current && isVisible) {
					toggleVisibility(false);
				}
			}}
		>
			<button
				onClick={() => {
					if (isVisible) {
						toggleVisibility(false);
						return;
					}
					toggleVisibility(true);
				}}
				className='flex items-center justify-center outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-sm'
			>
				<NotificationIcon />
			</button>

			<div
				className={`absolute scale-90 top-[30px] -right-40 bg-bg-main rounded-xl border border-primary py-[13.5px] z-10 min-w-[344px] sm:min-w-[400px] max-h-[460px] px-1 ${
					isVisible ? 'opacity-100 h-auto' : 'opacity-0 h-0 pointer-events-none hidden'
				}`}
				onMouseEnter={() => {
					isMouseEnter.current = true;
				}}
				onMouseLeave={() => {
					isMouseEnter.current = false;
				}}
			>
				<div className='flex gap-x-5 items-center justify-between mb-1 px-3'>
					<h3 className='text-white font-bold text-lg'>Notifications</h3>
					{!!unreadNotificationAvailable?.length && (
						<button
							onClick={() => markAllRead()}
							className='outline-none border-none shadow-none py-[6px[ px-[10px] text-sm flex items-center justify-center h-[25px] rounded-md text-failure bg-failure bg-opacity-10'
						>
							Mark all as read
						</button>
					)}
				</div>
				<div className='overflow-y-auto px-3 pt-0 max-h-[375px] '>
					<div>
						{loading ? (
							<Loader size='large' />
						) : notifications.length > 0 ? (
							<section>
								<div className='flex flex-col gap-y-[10px] mt-2'>
									{notifications.map((notification, index) => {
										return (
											<NotificationCard
												key={index}
												id={notification.id}
												addresses={notification.addresses}
												type={notification.type}
												message={notification.message}
												created_at={notification.created_at}
												link={notification.link}
												network={notification.network}
											/>
										);
									})}
								</div>
							</section>
						) : (
							<section className='flex flex-col items-center'>
								<div className='mt-10'>
									<NoNotification />
								</div>
								<p className='text-white text-base font-medium mt-10'>No new notifications</p>
							</section>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Notification;
