// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, MenuProps, Switch, Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CancelBtn from '@next-substrate/app/components/Settings/CancelBtn';
import RemoveBtn from '@next-substrate/app/components/Settings/RemoveBtn';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { CHANNEL, IUserNotificationTriggerPreferences, NotificationStatus, Triggers } from '@next-common/types';
import {
	BellIcon,
	CheckOutlined,
	CircleArrowDownIcon,
	DiscordIcon,
	ElementIcon,
	MailIcon,
	SlackIcon,
	TelegramIcon,
	WarningCircleIcon
} from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import queueNotification from '@next-common/ui-components/QueueNotification';

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from '@next-substrate/utils/nextApiClientFetch';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import DiscordInfoModal from './DiscordInfoModal';
import SlackInfoModal from './SlackInfoModal';
import TelegramInfoModal from './TelegramInfoModal';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';

// eslint-disable-next-line sonarjs/cognitive-complexity
const Notifications = () => {
	const { network } = useGlobalApiContext();
	const pathname = usePathname();
	const { notification_preferences, address, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [notifyAfter, setNotifyAfter] = useState<number>(8);
	const emailPreference = notification_preferences?.channelPreferences?.[CHANNEL.EMAIL];
	const [email, setEmail] = useState<string>(emailPreference?.handle || '');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [txnExecuted, setTxnExecuted] = useState<boolean>(false);
	const [cancelledTxn, setCancelledTxn] = useState<boolean>(false);
	const [scheduleTxn, setScheduleTxn] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [channelPreferencesLoading, setChannelPreferencesLoading] = useState<boolean>(false);
	const [verificationLoading, setVerificationLoading] = useState<boolean>(false);

	const [openTelegramModal, setOpenTelegramModal] = useState<boolean>(false);
	const [openDiscordModal, setOpenDiscordModal] = useState<boolean>(false);
	const [openSlackModal, setOpenSlackModal] = useState<boolean>(false);
	const [remindersFromOthers, setReminderFromOthers] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [resendEmail, setResendEmail] = useState<boolean>(emailPreference?.verified || false);
	const [enabledUpdate, setEnableUpdate] = useState<boolean>(false);

	const emailVerificationRegex =
		// eslint-disable-next-line security/detect-unsafe-regex
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	useEffect(() => {
		if (email) {
			const validEmail = emailVerificationRegex.test(email);
			if (validEmail) {
				setEmailValid(true);
			} else {
				setEmailValid(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email]);

	useEffect(() => {
		const triggerPreferences = notification_preferences?.triggerPreferences;
		if (triggerPreferences) {
			setNewTxn(triggerPreferences[Triggers.INIT_MULTISIG_TRANSFER]?.enabled || false);
			setTxnExecuted(triggerPreferences[Triggers.EXECUTED_TRANSACTION]?.enabled || false);
			setCancelledTxn(triggerPreferences[Triggers.CANCELLED_TRANSACTION]?.enabled || false);
			setScheduleTxn(triggerPreferences[Triggers.SCHEDULED_APPROVAL_REMINDER]?.enabled || false);
			setNotifyAfter(triggerPreferences[Triggers.SCHEDULED_APPROVAL_REMINDER]?.hoursToRemindIn || 8);
			setReminderFromOthers(triggerPreferences[Triggers.APPROVAL_REMINDER]?.enabled || false);
		}
	}, [notification_preferences]);

	const handleEnableUpdate = () => {
		if (notification_preferences) {
			const { triggerPreferences } = notification_preferences;
			const oldPreferences = {
				cancelledTxn: triggerPreferences[Triggers.CANCELLED_TRANSACTION]?.enabled || false,
				newTxn: triggerPreferences[Triggers.INIT_MULTISIG_TRANSFER]?.enabled || false,
				notifyAfter: triggerPreferences[Triggers.SCHEDULED_APPROVAL_REMINDER]?.hoursToRemindIn || 8,
				remindersFromOthers: triggerPreferences[Triggers.APPROVAL_REMINDER]?.enabled || false,
				scheduleTxn: triggerPreferences[Triggers.SCHEDULED_APPROVAL_REMINDER]?.enabled || false,
				txnExecuted: triggerPreferences[Triggers.EXECUTED_TRANSACTION]?.enabled || false
			};
			const newPreferences = {
				cancelledTxn,
				newTxn,
				notifyAfter,
				remindersFromOthers,
				scheduleTxn,
				txnExecuted
			};
			if (JSON.stringify(oldPreferences) === JSON.stringify(newPreferences)) {
				setEnableUpdate(false);
				return;
			}
			setEnableUpdate(true);
		}
	};

	useEffect(() => {
		handleEnableUpdate();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelledTxn, newTxn, scheduleTxn, txnExecuted, notifyAfter, remindersFromOthers, notification_preferences]);
	const notifyAfterHours: MenuProps['items'] = [8, 12, 24, 48].map((hr) => {
		return {
			key: hr,
			label: (
				<span className={`${hr === notifyAfter ? 'text-primary' : 'text-white'}`}>
					{hr === 1 ? `${hr} hr` : `${hr} hrs`}
				</span>
			)
		};
	});

	const onNotifyHoursChange: MenuProps['onClick'] = ({ key }) => {
		setNotifyAfter(Number(key));
	};

	const updateNotificationPreferences = async () => {
		try {
			const userAddress = localStorage.getItem('address');
			// const signature = localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
			} else {
				const newPreferences: { [index: string]: IUserNotificationTriggerPreferences } = {
					[Triggers.CANCELLED_TRANSACTION]: {
						enabled: cancelledTxn,
						name: Triggers.CANCELLED_TRANSACTION
					},
					[Triggers.EXECUTED_TRANSACTION]: {
						enabled: txnExecuted,
						name: Triggers.EXECUTED_TRANSACTION
					},
					[Triggers.EDIT_MULTISIG_USERS_EXECUTED]: {
						enabled: txnExecuted,
						name: Triggers.EDIT_MULTISIG_USERS_EXECUTED
					},
					[Triggers.EXECUTED_PROXY]: {
						enabled: txnExecuted,
						name: Triggers.EXECUTED_PROXY
					},
					[Triggers.INIT_MULTISIG_TRANSFER]: {
						enabled: newTxn,
						name: Triggers.INIT_MULTISIG_TRANSFER
					},
					[Triggers.CREATED_PROXY]: {
						enabled: newTxn,
						name: Triggers.CREATED_PROXY
					},
					[Triggers.SCHEDULED_APPROVAL_REMINDER]: {
						enabled: scheduleTxn,
						hoursToRemindIn: notifyAfter,
						name: Triggers.SCHEDULED_APPROVAL_REMINDER
					},
					[Triggers.EDIT_MULTISIG_USERS_START]: {
						enabled: newTxn,
						name: Triggers.EDIT_MULTISIG_USERS_START
					},
					[Triggers.APPROVAL_REMINDER]: {
						enabled: remindersFromOthers,
						name: Triggers.APPROVAL_REMINDER
					}
				};
				setLoading(true);

				const { data: updateNotificationTriggerData, error: updateNotificationTriggerError } =
					await nextApiClientFetch<string>(
						`${SUBSTRATE_API_URL}/updateNotificationTriggerPreferences`,
						{
							triggerPreferences: newPreferences
						},
						{ network }
					);

				if (updateNotificationTriggerError) {
					queueNotification({
						header: 'Failed!',
						message: updateNotificationTriggerError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if (updateNotificationTriggerData) {
					queueNotification({
						header: 'Success!',
						message: 'Your Notification Preferences has been Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState((prev) => ({
						...prev,
						notification_preferences: { ...prev.notification_preferences, triggerPreferences: newPreferences }
					}));
					setLoading(false);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Notification Preferences.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	const updateNotificationChannelPreferences = async ({
		channel,
		enabled,
		reset
	}: {
		channel: CHANNEL;
		enabled?: boolean;
		reset?: boolean;
	}) => {
		try {
			const userAddress = localStorage.getItem('address');
			// const signature = localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
				return;
			}
			setChannelPreferencesLoading(true);

			const newChannelPreferences = reset
				? {
						...notification_preferences.channelPreferences,
						[channel]: { enabled: false, handle: '', name: channel, verification_token: '', verified: false }
					}
				: {
						...notification_preferences.channelPreferences,
						[channel]: { ...notification_preferences.channelPreferences?.[channel], enabled }
					};

			const { data: updateNotificationTriggerData, error: updateNotificationTriggerError } =
				await nextApiClientFetch<string>(
					`${SUBSTRATE_API_URL}/updateNotificationChannelPreferences`,
					{
						channelPreferences: newChannelPreferences
					},
					{ network }
				);

			if (updateNotificationTriggerError) {
				queueNotification({
					header: 'Failed!',
					message: updateNotificationTriggerError,
					status: NotificationStatus.ERROR
				});
				setChannelPreferencesLoading(false);
				return;
			}

			if (updateNotificationTriggerData) {
				queueNotification({
					header: 'Success!',
					message: 'Your Notification Preferences has been Updated.',
					status: NotificationStatus.SUCCESS
				});
				if (enabled !== undefined) {
					setUserDetailsContextState((prev) => ({
						...prev,
						notification_preferences: {
							...prev.notification_preferences,
							channelPreferences: {
								...prev.notification_preferences.channelPreferences,
								[channel]: { ...prev.notification_preferences.channelPreferences?.[channel], enabled }
							}
						}
					}));
				}
				if (reset) {
					setUserDetailsContextState((prev) => ({
						...prev,
						notification_preferences: {
							...prev.notification_preferences,
							channelPreferences: {
								...prev.notification_preferences.channelPreferences,
								[channel]: { enabled: false, handle: '', name: channel, verification_token: '', verified: false }
							}
						}
					}));
				}
				setChannelPreferencesLoading(false);
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Notification Preferences.',
				status: NotificationStatus.ERROR
			});
			setChannelPreferencesLoading(false);
		}
	};

	const verifyEmail = async () => {
		try {
			const userAddress = localStorage.getItem('address');
			// const signature = localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
			} else {
				setVerificationLoading(true);

				const { data: verifyEmailUpdate, error: verifyTokenError } = await nextApiClientFetch<string>(
					`${SUBSTRATE_API_URL}/notify`,
					{
						args: {
							address,
							email
						},
						trigger: 'verifyEmail'
					},
					{ network }
				);

				if (verifyTokenError) {
					queueNotification({
						header: 'Failed!',
						message: verifyTokenError,
						status: NotificationStatus.ERROR
					});
					setVerificationLoading(false);
					return;
				}

				if (verifyEmailUpdate) {
					queueNotification({
						header: 'Success!',
						message: 'Verification Email Sent.',
						status: NotificationStatus.SUCCESS
					});
					setResendEmail(false);
					setTimeout(() => setResendEmail(true), 60000);
					setUserDetailsContextState((prev) => ({
						...prev,
						notification_preferences: {
							...prev.notification_preferences,
							channelPreferences: {
								...prev.notification_preferences.channelPreferences,
								[CHANNEL.EMAIL]: {
									enabled: false,
									handle: email,
									name: CHANNEL.EMAIL,
									verified: false
								}
							}
						}
					}));
					setVerificationLoading(false);
				}
			}
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Sending Verification Email.',
				status: NotificationStatus.ERROR
			});
			setVerificationLoading(false);
		}
	};

	const getVerifyToken = async (channel: CHANNEL) => {
		try {
			const userAddress = localStorage.getItem('address');
			// const signature = localStorage.getItem('signature');

			if (!userAddress) {
				console.log('ERROR');
			} else {
				const { data: verifyToken, error: verifyTokenError } = await nextApiClientFetch<string>(
					`${SUBSTRATE_API_URL}/getChannelVerifyToken`,
					{
						channel
					},
					{ network }
				);

				if (verifyTokenError) {
					queueNotification({
						header: 'Failed!',
						message: verifyTokenError,
						status: NotificationStatus.ERROR
					});
					return undefined;
				}

				if (verifyToken) {
					return verifyToken;
				}
			}
			return undefined;
		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in generating token.',
				status: NotificationStatus.ERROR
			});
			return undefined;
		}
	};

	return (
		<div
			className={`flex flex-col gap-y-4 ${
				pathname === '/notification-settings' && 'scale-[80%] h-[125%] w-[125%] origin-top-left'
			}`}
		>
			<AddMultisigModal />
			<ModalComponent
				onCancel={() => setOpenTelegramModal(false)}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'>
						<TelegramIcon className='text-text_secondary' /> How to add Telegram Bot
					</h3>
				}
				open={openTelegramModal}
			>
				{notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle &&
				notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.verified ? (
					<div>
						<span className='text-white'>Are you sure you want to Reset Telegram Handle?</span>
						<div className='flex items-center justify-between mt-5'>
							<CancelBtn
								title='No'
								onClick={() => setOpenTelegramModal(false)}
							/>
							<RemoveBtn
								loading={channelPreferencesLoading}
								title='Yes'
								onClick={async () => {
									setOpenTelegramModal(true);
									await updateNotificationChannelPreferences({ channel: CHANNEL.TELEGRAM, reset: true });
									setOpenTelegramModal(false);
								}}
							/>
						</div>
					</div>
				) : (
					<TelegramInfoModal getVerifyToken={getVerifyToken} />
				)}
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenDiscordModal(false)}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'>
						<DiscordIcon className='text-text_secondary' /> How to add Discord Bot
					</h3>
				}
				open={openDiscordModal}
			>
				{notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.handle &&
				notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.verified ? (
					<div>
						<span className='text-white'>Are you sure you want to Reset Discord Handle?</span>
						<div className='flex items-center justify-between mt-5'>
							<CancelBtn
								title='No'
								onClick={() => setOpenDiscordModal(false)}
							/>
							<RemoveBtn
								loading={channelPreferencesLoading}
								title='Yes'
								onClick={async () => {
									setOpenDiscordModal(true);
									await updateNotificationChannelPreferences({ channel: CHANNEL.DISCORD, reset: true });
									setOpenDiscordModal(false);
								}}
							/>
						</div>
					</div>
				) : (
					<DiscordInfoModal getVerifyToken={getVerifyToken} />
				)}
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenSlackModal(false)}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'>
						<SlackIcon className='text-text_secondary' /> How to add Slack Bot
					</h3>
				}
				open={openSlackModal}
			>
				{notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.handle &&
				notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.verified ? (
					<div>
						<span className='text-white'>Are you sure you want to Reset Slack Handle?</span>
						<div className='flex items-center justify-between mt-5'>
							<CancelBtn
								title='No'
								onClick={() => setOpenSlackModal(false)}
							/>
							<RemoveBtn
								loading={channelPreferencesLoading}
								title='Yes'
								onClick={async () => {
									setOpenSlackModal(true);
									await updateNotificationChannelPreferences({ channel: CHANNEL.SLACK, reset: true });
									setOpenSlackModal(false);
								}}
							/>
						</div>
					</div>
				) : (
					<SlackInfoModal getVerifyToken={getVerifyToken} />
				)}
			</ModalComponent>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-text_secondary'>
				<div className='col-span-3'>
					<span className='flex items-center gap-x-2'>
						<BellIcon /> General
					</span>
				</div>
				<div className='col-span-7'>
					<p className='mb-4'>Configure the notifications you want Polkasafe to send in your linked channels</p>
					<div className='flex flex-col gap-y-3'>
						<div className='flex'>
							<Checkbox
								disabled={loading}
								className='text-white m-0 [&>span>span]:border-primary'
								checked={newTxn}
								onChange={(e) => setNewTxn(e.target.checked)}
							>
								New Transaction needs to be signed
							</Checkbox>
						</div>
						<div className='flex'>
							<Checkbox
								disabled={loading}
								className='text-white m-0 [&>span>span]:border-primary'
								checked={txnExecuted}
								onChange={(e) => setTxnExecuted(e.target.checked)}
							>
								Transaction has been signed and executed
							</Checkbox>
						</div>
						<div className='flex'>
							<Checkbox
								disabled={loading}
								className='text-white m-0 [&>span>span]:border-primary'
								checked={cancelledTxn}
								onChange={(e) => setCancelledTxn(e.target.checked)}
							>
								Transaction has been cancelled
							</Checkbox>
						</div>
						<div className='flex'>
							<Checkbox
								disabled={loading}
								className='text-white m-0 [&>span>span]:border-primary'
								checked={remindersFromOthers}
								onChange={(e) => setReminderFromOthers(e.target.checked)}
							>
								Get reminders from other signatories
							</Checkbox>
						</div>
						<div className='flex items-center gap-x-3'>
							<Checkbox
								disabled={loading}
								className='text-white m-0 [&>span>span]:border-primary'
								checked={scheduleTxn}
								onChange={(e) => setScheduleTxn(e.target.checked)}
							>
								For Pending Transactions remind signers every:
							</Checkbox>
							<Dropdown
								disabled={!scheduleTxn || loading}
								className='text-white'
								trigger={['click']}
								menu={{ items: notifyAfterHours, onClick: onNotifyHoursChange }}
							>
								<button
									className={`'flex items-center gap-x-2 border ${
										!scheduleTxn || loading ? 'border-text_secondary' : 'border-primary'
									} rounded-md px-3 py-1 text-sm leading-[15px] text-text_secondary`}
								>
									{`${notifyAfter} ${notifyAfter === 1 ? 'hr' : 'hrs'}`}{' '}
									<CircleArrowDownIcon
										className={`hidden md:inline-flex text-base ${
											!scheduleTxn || loading ? 'text-text_secondary' : 'text-primary'
										}`}
									/>
								</button>
							</Dropdown>
						</div>
					</div>
					<div className='mt-4'>
						<Button
							disabled={!enabledUpdate}
							onClick={updateNotificationPreferences}
							className={`text-white bg-primary rounded-lg cursor-pointer ${
								!enabledUpdate && 'opacity-50 cursor-default'
							}`}
						>
							Save
						</Button>
					</div>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4'>
				<div className='col-span-3'>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<MailIcon /> Email Notifications
					</span>
				</div>
				<Form className='col-span-5 flex items-start gap-x-3'>
					<Form.Item
						name='email'
						rules={[{ required: true }]}
						help={!emailValid && 'Please enter a valid email'}
						className='border-0 outline-0 my-0 p-0 w-full'
						validateStatus={!emailValid ? 'error' : 'success'}
					>
						<Input
							id='email'
							defaultValue={emailPreference?.handle || ''}
							onChange={(a) => setEmail(a.target.value.toLowerCase())}
							placeholder='Enter email'
							className='w-full text-sm font-normal leading-[15px] border-0 outline-0 p-2 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
						/>
					</Form.Item>
					<PrimaryButton
						loading={verificationLoading}
						onClick={verifyEmail}
						disabled={!email || !emailValid || emailPreference?.handle === email}
					>
						<p className='font-normal text-sm'>Verify</p>
					</PrimaryButton>
				</Form>
				{emailPreference?.verified && emailPreference?.handle === email && (
					<div className='flex items-center col-span-2 ml-5 gap-x-2'>
						<CheckOutlined className='text-success' />
						<div className='text-white'>Email Verified!</div>
					</div>
				)}
				<div className='col-span-3' />
				{emailPreference?.handle === email && !emailPreference?.verified && (
					<section className='mt-2 col-span-5 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
						<WarningCircleIcon />
						<p>An email has been sent to your email address. Click on the sent link to Verify your email address</p>
					</section>
				)}
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white max-sm:flex max-sm:flex-col'>
				<div className='col-span-3 flex items-center gap-x-2'>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<TelegramIcon /> Telegram Notifications
					</span>
					{notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle &&
						notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.verified && (
							<Switch
								disabled={channelPreferencesLoading}
								size='small'
								onChange={(checked) =>
									updateNotificationChannelPreferences({ channel: CHANNEL.TELEGRAM, enabled: checked })
								}
								defaultChecked={notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.enabled}
							/>
						)}
				</div>
				<div className='col-span-5'>
					{notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle &&
					notification_preferences.channelPreferences?.[CHANNEL.TELEGRAM]?.verified ? (
						<div className='flex items-center gap-x-2'>
							<CheckOutlined className='text-success' />
							<div className='text-white'>Telegram Verified!</div>
							<Button
								onClick={() => setOpenTelegramModal(true)}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								RESET
							</Button>
						</div>
					) : (
						<div className='flex items-center'>
							<Button
								onClick={() => setOpenTelegramModal(true)}
								icon={<PlusCircleOutlined className='text-primary' />}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								ADD THE POLKASAFE BOT
							</Button>
							<span>to a Telegram chat to get Telegram notifications</span>
						</div>
					)}
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3 flex items-center gap-x-2'>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<DiscordIcon /> Discord Notifications
					</span>
					{notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.handle &&
						notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.verified && (
							<Switch
								disabled={channelPreferencesLoading}
								size='small'
								onChange={(checked) =>
									updateNotificationChannelPreferences({ channel: CHANNEL.DISCORD, enabled: checked })
								}
								defaultChecked={notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.enabled}
							/>
						)}
				</div>
				<div className='col-span-5'>
					{notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.handle &&
					notification_preferences.channelPreferences?.[CHANNEL.DISCORD]?.verified ? (
						<div className='flex items-center gap-x-2'>
							<CheckOutlined className='text-success' />
							<div className='text-white'>Discord Verified!</div>
							<Button
								onClick={() => setOpenDiscordModal(true)}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								RESET
							</Button>
						</div>
					) : (
						<div className='flex items-center'>
							<Button
								onClick={() => setOpenDiscordModal(true)}
								icon={<PlusCircleOutlined className='text-primary' />}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								ADD THE POLKASAFE BOT
							</Button>
							<span>to a Discord channel to get Discord notifications</span>
						</div>
					)}
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3 flex items-center gap-x-2'>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<SlackIcon /> Slack Notifications
					</span>
					{notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.handle &&
						notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.verified && (
							<Switch
								disabled={channelPreferencesLoading}
								size='small'
								onChange={(checked) =>
									updateNotificationChannelPreferences({ channel: CHANNEL.SLACK, enabled: checked })
								}
								defaultChecked={notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.enabled}
							/>
						)}
				</div>
				<div className='col-span-5'>
					{notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.handle &&
					notification_preferences.channelPreferences?.[CHANNEL.SLACK]?.verified ? (
						<div className='flex items-center gap-x-2'>
							<CheckOutlined className='text-success' />
							<div className='text-white'>Slack Verified!</div>
							<Button
								onClick={() => setOpenSlackModal(true)}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								RESET
							</Button>
						</div>
					) : (
						<div className='flex items-center'>
							<Button
								onClick={() => setOpenSlackModal(true)}
								icon={<PlusCircleOutlined className='text-primary' />}
								className='flex items-center outline-none border-none bg-transparant text-primary'
							>
								ADD THE POLKASAFE BOT
							</Button>
							<span>to a Slack channel to get Slack notifications</span>
						</div>
					)}
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3'>
					<span className='flex items-center gap-x-2 text-text_secondary'>
						<ElementIcon /> Element Notifications
					</span>
				</div>
				<div className='col-span-5 text-primary'>COMING SOON...</div>
			</div>
		</div>
	);
};

export default Notifications;
