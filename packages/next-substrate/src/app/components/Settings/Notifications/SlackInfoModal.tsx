// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CHANNEL } from '@next-common/types';
import { CopyIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import copyText from '@next-substrate/utils/copyText';

const SlackInfoModal = ({ getVerifyToken }: { getVerifyToken: (channel: CHANNEL) => Promise<string | void> }) => {
	const [loading, setLoading] = React.useState(false);
	const { notification_preferences, address, setUserDetailsContextState } = useGlobalUserDetailsContext();

	const handleGenerateToken = async () => {
		setLoading(true);
		const verifyToken = await getVerifyToken(CHANNEL.SLACK);
		setUserDetailsContextState((prev) => ({
			...prev,
			notification_preferences: {
				...prev.notification_preferences,
				channelPreferences: {
					...prev.notification_preferences.channelPreferences,
					[`${CHANNEL.SLACK}`]: {
						...prev.notification_preferences.channelPreferences?.[`${CHANNEL.SLACK}`],
						verification_token: verifyToken || ''
					}
				}
			}
		}));
		setLoading(false);
	};

	return (
		<div className='text-white'>
			<ol>
				<li className='list-inside leading-[40px]'>
					Click this invite link:
					<div className='px-2 mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'>
						<a
							href='https://premiurly.slack.com/apps/A057XPP28G4-polkassembly'
							target='_blank'
							rel='noreferrer'
						>
							https://premiurly.slack.com/apps/A057XPP28G4-polkassembly
						</a>
					</div>
				</li>
				<li className='list-inside leading-[35px] mb-5'>
					Send this command to the chat with the bot:
					<div className='flex items-center justify-between'>
						{
							// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
							<span
								onClick={() =>
									copyText(
										`/polkasafe-add ${address} ${
											notification_preferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token || ''
										}`
									)
								}
								className='px-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'
							>
								<CopyIcon /> /polkasafe-add {'<web3-address>'} {'<verification-token>'}
							</span>
						}
						<PrimaryButton
							loading={loading}
							onClick={handleGenerateToken}
							className='bg-primary text-white font-normal'
						>
							Generate Token
						</PrimaryButton>
					</div>
					{notification_preferences?.channelPreferences?.[`${CHANNEL.SLACK}`]?.verification_token && (
						<div className='flex items-center justify-between mt-3'>
							<span>Verification Token: </span>
							<span
								onClick={() =>
									copyText(notification_preferences?.channelPreferences?.[`${CHANNEL.SLACK}`]?.verification_token || '')
								}
								className='px-2 cursor-pointer mx-2 rounded-md bg-bg-secondary text-primary border border-solid border-text_secondary'
							>
								<CopyIcon /> {notification_preferences?.channelPreferences?.[`${CHANNEL.SLACK}`]?.verification_token}
							</span>
						</div>
					)}
				</li>
			</ol>
		</div>
	);
};

export default SlackInfoModal;
