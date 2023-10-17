// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useCallback, useEffect } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CHANNEL, NotificationStatus } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';

const VerifyEmailToken = () => {
	const searchParams = useSearchParams();
	const { network } = useGlobalApiContext();
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();

	const verifyEmail = useCallback(async () => {
		const email = searchParams.get('email');
		const token = searchParams.get('token');
		const { data: verifyEmailData, error: verifyEmailError } = await nextApiClientFetch<string>(
			`${SUBSTRATE_API_URL}/verifyEmail`,
			{
				email,
				token
			},
			{ network }
		);

		if (verifyEmailError) {
			console.log(verifyEmailError);
			return;
		}

		if (verifyEmailData) {
			queueNotification({
				header: 'Success!',
				message: 'Your Email has been verified.',
				status: NotificationStatus.SUCCESS
			});
			setUserDetailsContextState((prev) => ({
				...prev,
				notification_preferences: {
					...prev.notification_preferences,
					channelPreferences: {
						...prev.notification_preferences.channelPreferences,
						[CHANNEL.EMAIL]: {
							...prev.notification_preferences.channelPreferences?.[CHANNEL.EMAIL],
							verified: true
						}
					}
				}
			}));
			redirect('/notification-settings');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		verifyEmail();
	}, [verifyEmail]);

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<Loader text='Verifying Email...' />
		</div>
	);
};

export default VerifyEmailToken;
