// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { NotificationStatus } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import queueNotification from '@next-common/ui-components/QueueNotification';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-evm/utils/firebaseFunctionHeaders';

const VerifyEmailToken = () => {
	const searchParams = useSearchParams();

	useEffect(() => {
		const email = searchParams.get('email');
		const token = searchParams.get('token');
		const verifyEmail = async () => {
			const verifyEmailRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/verifyEmail`, {
				body: JSON.stringify({
					email,
					token
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});
			const { data: verifyEmailData, error: verifyEmailError } = (await verifyEmailRes.json()) as {
				data: string;
				error: string;
			};

			if (verifyEmailError) {
				console.log(verifyEmailData);
				return;
			}

			if (verifyEmailData) {
				queueNotification({
					header: 'Success!',
					message: 'Your Email has been verified.',
					status: NotificationStatus.SUCCESS
				});
				redirect('/');
			}
		};
		verifyEmail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<Loader />
		</div>
	);
};

export default VerifyEmailToken;
