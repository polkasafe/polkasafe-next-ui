// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { NotificationStatus } from '@next-common/types';
import Loader from '@next-common/ui-components/Loader';
import queueNotification from '@next-common/ui-components/QueueNotification';
import nextApiClientFetch from '@next-evm/utils/nextApiClientFetch';
import { EVM_API_URL } from '@next-common/global/apiUrls';

const VerifyEmailToken = () => {
	const searchParams = useSearchParams();
	const { network } = useGlobalApiContext();

	useEffect(() => {
		const email = searchParams.get('email');
		const token = searchParams.get('token');
		const verifyEmail = async () => {
			const { data: verifyEmailData, error: verifyEmailError } = await nextApiClientFetch<string>(
				`${EVM_API_URL}/verifyEmail`,
				{
					email,
					token
				},
				{ network }
			);

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
