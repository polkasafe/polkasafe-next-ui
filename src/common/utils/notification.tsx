// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

'use client';

import Loader from '@common/global-ui-components/Loder';
import { NotificationStatus } from '@common/types/substrate';
import { App } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import { ReactNode } from 'react';

interface Props {
	message: ReactNode;
	description?: ReactNode;
	durationInSeconds?: number;
	status: NotificationStatus;
	placement?: NotificationPlacement;
	className?: string;
	closeIcon?: ReactNode;
}

export const useNotification = () => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { notification: antdNotification } = App.useApp();
	return ({ description, closeIcon, className, message, durationInSeconds = 4.5, status, placement }: Props) => {
		const customClassNames = `bg-bg-main text-white bg-gradient-to-r p-4 rounded-md ${
			status === NotificationStatus.SUCCESS
				? '   from-[#06d6a0]/[0.2] '
				: status === NotificationStatus.ERROR
					? 'from-[#e63946]/[0.2]'
					: status === NotificationStatus.INFO
						? 'from-[#1573fe]/[0.2]'
						: ''
		}`;

		const args = {
			className: className || customClassNames || '',
			closeIcon,
			message: <span className='text-white text-semibold'>{message}</span>,
			description: <span className='text-white'>{description}</span>,
			duration: durationInSeconds,
			placement: placement || 'topRight',
			maxCount: 1,
			...(status === NotificationStatus.INFO ? { icon: <Loader /> } : {})
		};
		antdNotification[status](args);
	};
};
