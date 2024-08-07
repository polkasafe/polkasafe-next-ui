// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC } from 'react';
import Link from 'next/link';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { INotification } from '@next-common/types';
import { ArrowDownLeftIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';

export enum ENotificationStatus {
	READ = 'READ',
	UNREAD = 'UNREAD'
}

const NotificationCard: FC<INotification> = ({ message, created_at, link, network }) => {
	const status = '' as any;
	return (
		<Link
			href={link || '#'}
			className={`flex items-center gap-x-4 rounded-lg p-3 ${status === ENotificationStatus.UNREAD && 'bg-highlight'}`}
		>
			{status === ENotificationStatus.UNREAD && (
				<div>
					<span className='block h-[10px] w-[10px] rounded-full bg-primary' />
				</div>
			)}
			<div className='flex flex-col gap-y-1'>
				<p className='text-sm font-medium text-white'>
					{message} ({status})
				</p>
				<span className='flex gap-x-2'>
					<p className='text-xs font-normal text-text_secondary'>
						<span>{dayjs(created_at).format('D-MM-YY')} </span>
						at
						<span> {dayjs(created_at).format('HH:mm')}</span>
					</p>
					<p className='text-xs font-normal text-text_secondary'>
						<Image
							className='rounded-full'
							alt='Network logo'
							height={14}
							width={14}
							src={chainProperties[network]?.logo}
						/>
					</p>
				</span>
			</div>
			<button className='shadow-none flex items-center justify-center outline-none border-none text-blue_secondary ml-auto p-3 bg-success rounded-lg bg-opacity-10 text-success text-sm'>
				<ArrowDownLeftIcon />
			</button>
		</Link>
	);
};

export default NotificationCard;
