// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECHANNEL } from '@common/enum/substrate';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { CopyIcon } from '@common/global-ui-components/Icons';
import { INotificationPreferences } from '@common/types/substrate';
import copyText from '@common/utils/copyText';
import { useState } from 'react';

const Telegram = ({
	preferences,
	onAction
}: {
	preferences?: INotificationPreferences;
	onAction: () => Promise<void>;
}) => {
	const [loading, setLoading] = useState(false);

	const handleGenerateToken = async () => {
		try {
			setLoading(true);
			await onAction();
		} catch (error) {
			// do nothing
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='text-white'>
			<ol>
				<li className='list-inside leading-[40px]'>
					Click this invite link
					<span className='p-2 mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
						<a
							href='https://t.me/PolkasafeBot'
							target='_blank'
							rel='noreferrer'
						>
							t.me/PolkasafeBot
						</a>
					</span>
					<br />
					or Add
					<span
						onClick={() => copyText('@PolkasafeBot')}
						className='p-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'
					>
						<CopyIcon /> @PolkasafeBot
					</span>
					to your Telegram Chat as a member
				</li>
				<li className='list-inside leading-[35px] mb-5'>
					Send this command to the chat with the bot:
					<div className='flex items-center justify-between'>
						<Button
							variant={EButtonVariant.PRIMARY}
							loading={loading}
							size='middle'
							onClick={handleGenerateToken}
							className='bg-primary text-white font-normal'
						>
							Generate Token
						</Button>
					</div>
					{preferences?.channelPreferences?.[`${ECHANNEL.TELEGRAM}`]?.verification_token && (
						<div className='flex items-center justify-between mt-3'>
							<span>Verification Token: </span>
							<span
								onClick={() =>
									copyText(preferences?.channelPreferences?.[`${ECHANNEL.TELEGRAM}`]?.verification_token || '')
								}
								className='px-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'
							>
								<CopyIcon /> {preferences?.channelPreferences?.[`${ECHANNEL.TELEGRAM}`]?.verification_token}
							</span>
						</div>
					)}
				</li>
				<li className='list-inside'>
					(Optional) Send this command to get help:
					<span
						onClick={() => copyText('/start')}
						className='p-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'
					>
						<CopyIcon /> /start
					</span>
				</li>
			</ol>
		</div>
	);
};

export default Telegram;
