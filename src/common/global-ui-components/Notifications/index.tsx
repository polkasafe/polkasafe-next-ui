import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import {
	CircleArrowDownIcon,
	DiscordIcon,
	NotificationIcon,
	SlackIcon,
	TelegramIcon
} from '@common/global-ui-components/Icons';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Form, MenuProps } from 'antd';
import Typography, { ETypographyVariants } from '@common/global-ui-components/Typography';
import { INotificationPreferences, ITriggerPreferences } from '@common/types/substrate';
import { notificationForm } from '@common/global-ui-components/Notifications/utils/form';
import { NotificationRow } from '@common/global-ui-components/Notifications/components/NotificationRow';
import { ECHANNEL, ETriggers } from '@common/enum/substrate';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { notificationPreferences } from '@sdk/polkasafe-sdk/src/notification-preferences';
import { useState } from 'react';
import { VerifyEmail } from '@common/global-ui-components/Notifications/components/VerifyEmail';
import { verifyToken } from '@sdk/polkasafe-sdk/src/verify-token';
import { NotificationModal } from '@common/global-ui-components/Notifications/modals/NotificationModal';
import Telegram from '@common/global-ui-components/Notifications/modals/Telegram';
import Slack from '@common/global-ui-components/Notifications/modals/Slack';
import Discord from '@common/global-ui-components/Notifications/modals/Discord';

const notificationPlatforms = [
	{ icon: <TelegramIcon />, title: 'Telegram', channel: ECHANNEL.TELEGRAM },
	{ icon: <DiscordIcon />, title: 'Discord', channel: ECHANNEL.DISCORD },
	// { icon: <ElementIcon />, title: 'Element', channel: ECHANNEL.ELEMENT },
	{ icon: <SlackIcon />, title: 'Slack', channel: ECHANNEL.SLACK }
];

export const NotificationsUI = ({
	address,
	signature,
	preferences,
	onChange
}: {
	address: string;
	signature: string;
	preferences?: INotificationPreferences;
	onChange: (preferences: INotificationPreferences) => void;
}) => {
	const queueNotification = useNotification();
	const [form] = Form.useForm();

	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<number>(
		preferences?.triggerPreferences?.[ETriggers.SCHEDULED_APPROVAL_REMINDER]?.hoursToRemindIn || 8
	);
	const dropdownOptions = ['8', '12', '16', '24'];

	const items: MenuProps['items'] = dropdownOptions.map((option, index) => ({
		key: index.toString(),
		label: (
			<Typography
				variant={ETypographyVariants.p}
				className='text-white'
			>
				{option}
			</Typography>
		),
		onClick: () => {
			form.setFieldsValue({ notifyAfter: option });
			setSelected(Number(option));
		}
	}));
	const { triggerPreferences } = preferences || { triggerPreferences: null };
	const oldPreferences = {
		cancelledTxn: triggerPreferences?.[ETriggers.CANCELLED_TRANSACTION]?.enabled || false,
		newTxn: triggerPreferences?.[ETriggers.INIT_MULTISIG_TRANSFER]?.enabled || false,
		notifyAfter: triggerPreferences?.[ETriggers.SCHEDULED_APPROVAL_REMINDER]?.hoursToRemindIn || 8,
		remindersFromOthers: triggerPreferences?.[ETriggers.APPROVAL_REMINDER]?.enabled || false,
		scheduleTxn: triggerPreferences?.[ETriggers.SCHEDULED_APPROVAL_REMINDER]?.enabled || false,
		txnExecuted: triggerPreferences?.[ETriggers.EXECUTED_TRANSACTION]?.enabled || false
	};

	const updateNotificationPreferences = async ({
		cancelledTxn,
		newTxn,
		notifyAfter,
		remindersFromOthers,
		scheduleTxn,
		txnExecuted
	}: {
		cancelledTxn: boolean;
		newTxn: boolean;
		notifyAfter: number;
		remindersFromOthers: boolean;
		scheduleTxn: boolean;
		txnExecuted: boolean;
	}) => {
		const newPreferences = {
			[ETriggers.CANCELLED_TRANSACTION]: {
				enabled: cancelledTxn,
				name: ETriggers.CANCELLED_TRANSACTION
			},
			[ETriggers.EXECUTED_TRANSACTION]: {
				enabled: txnExecuted,
				name: ETriggers.EXECUTED_TRANSACTION
			},
			[ETriggers.EDIT_MULTISIG_USERS_EXECUTED]: {
				enabled: txnExecuted,
				name: ETriggers.EDIT_MULTISIG_USERS_EXECUTED
			},
			[ETriggers.EXECUTED_PROXY]: {
				enabled: txnExecuted,
				name: ETriggers.EXECUTED_PROXY
			},
			[ETriggers.INIT_MULTISIG_TRANSFER]: {
				enabled: newTxn,
				name: ETriggers.INIT_MULTISIG_TRANSFER
			},
			[ETriggers.CREATED_PROXY]: {
				enabled: newTxn,
				name: ETriggers.CREATED_PROXY
			},
			[ETriggers.SCHEDULED_APPROVAL_REMINDER]: {
				enabled: scheduleTxn,
				hoursToRemindIn: notifyAfter,
				name: ETriggers.SCHEDULED_APPROVAL_REMINDER
			},
			[ETriggers.EDIT_MULTISIG_USERS_START]: {
				enabled: newTxn,
				name: ETriggers.EDIT_MULTISIG_USERS_START
			},
			[ETriggers.APPROVAL_REMINDER]: {
				enabled: remindersFromOthers,
				name: ETriggers.APPROVAL_REMINDER
			}
		} as unknown as ITriggerPreferences;

		return notificationPreferences({ address, signature, triggerPreferences: newPreferences });
		// console.log(notificationPreferences);
	};

	const handleTriggers = async (values: any) => {
		setLoading(true);
		try {
			const { notification, notifyAfter } = values;
			const newPreferences = {
				cancelledTxn: notification.includes(ETriggers.CANCELLED_TRANSACTION) || false,
				newTxn: notification.includes(ETriggers.INIT_MULTISIG_TRANSFER) || false,
				notifyAfter: selected || notifyAfter || dropdownOptions[0],
				remindersFromOthers: notification.includes(ETriggers.APPROVAL_REMINDER) || false,
				scheduleTxn: notification.includes(ETriggers.SCHEDULED_APPROVAL_REMINDER) || false,
				txnExecuted: notification.includes(ETriggers.EXECUTED_TRANSACTION) || false
			};

			if (JSON.stringify(oldPreferences) === JSON.stringify(newPreferences)) {
				queueNotification(ERROR_MESSAGES.NO_CHANGES);
				return;
			}
			console.log(newPreferences);
			const { data } = (await updateNotificationPreferences(newPreferences)) as { data: INotificationPreferences };
			onChange(data);
			queueNotification(SUCCESS_MESSAGES.NOTIFICATIONS_UPDATED);
		} catch (error) {
			queueNotification(ERROR_MESSAGES.NOTIFICATIONS_ERROR);
		} finally {
			setLoading(false);
		}
	};

	const defaultValue = () => {
		const payload: any = {
			[ETriggers.INIT_MULTISIG_TRANSFER]:
				preferences?.triggerPreferences[ETriggers.INIT_MULTISIG_TRANSFER]?.enabled || false,
			[ETriggers.EXECUTED_TRANSACTION]:
				preferences?.triggerPreferences[ETriggers.EXECUTED_TRANSACTION]?.enabled || false,
			[ETriggers.CANCELLED_TRANSACTION]:
				preferences?.triggerPreferences[ETriggers.CANCELLED_TRANSACTION]?.enabled || false,
			[ETriggers.APPROVAL_REMINDER]: preferences?.triggerPreferences[ETriggers.APPROVAL_REMINDER]?.enabled || false,
			[ETriggers.SCHEDULED_APPROVAL_REMINDER]:
				preferences?.triggerPreferences[ETriggers.SCHEDULED_APPROVAL_REMINDER]?.enabled || false
		};
		return Object.keys(payload).filter((key: any) => Boolean(payload[key]));
	};

	const generateToken = async (channel: ECHANNEL) => {
		const { data: token } = (await verifyToken({
			address,
			signature,
			channel
		})) as { data: string };

		// update the token to the prefrences object
		const newPreferences = {
			...preferences,
			channelPreferences: {
				...preferences?.channelPreferences,
				[channel]: {
					...preferences?.channelPreferences[channel],
					verification_token: token
				}
			}
		} as INotificationPreferences;

		onChange(newPreferences);
	};

	return (
		<div className='overflow-y-auto pr-2'>
			<section className='flex flex-col gap-y-4'>
				<article className='bg-bg-secondary rounded-lg px-4 py-4 flex items-start justify-start gap-x-8'>
					<Typography
						variant={ETypographyVariants.p}
						className='bg-transparent text-text-secondary flex items-center justify-start basis-1/4 pt-0 gap-2'
					>
						<NotificationIcon /> General
					</Typography>
					<div className='flex flex-col gap-y-2 items-start'>
						<Typography
							variant={ETypographyVariants.p}
							className='m-0 p-0 text-text-secondary'
						>
							Configure the notifications you want Polkasafe to send in your linked channels
						</Typography>
						<Form
							onFinish={handleTriggers}
							form={form}
							initialValues={{
								notification: defaultValue(),
								notifyAfter: oldPreferences.notifyAfter || dropdownOptions[0]
							}}
						>
							<div className='flex items-end'>
								<Form.Item name='notification'>
									<Checkbox.Group
										options={notificationForm}
										className='text-white m-0 [&_>span>span]:border-primary flex flex-col gap-2'
									/>
								</Form.Item>
								<Form.Item
									name='notifyAfter'
									className='mb-4'
								>
									<Dropdown
										trigger={['click']}
										className='border border-text-secondary flex items-center justify-center rounded-lg p-1 px-2 bg-bg-secondary cursor-pointer mb-1'
										menu={{
											items
										}}
									>
										<div className='flex justify-between gap-x-2 items-center text-white text-xs'>
											<Typography
												variant={ETypographyVariants.p}
												className='text-text-tertiary text-xs'
											>
												{selected} hrs
											</Typography>
											<CircleArrowDownIcon className='text-primary' />
										</div>
									</Dropdown>
								</Form.Item>
							</div>

							<Button
								htmlType='submit'
								loading={loading}
								variant={EButtonVariant.PRIMARY}
								size='middle'
								className='min-w-0'
							>
								Save
							</Button>
						</Form>
					</div>
				</article>

				<VerifyEmail
					address={address}
					signature={signature}
				/>

				{notificationPlatforms.map((platform, index) => (
					<NotificationRow
						key={index}
						icon={platform.icon}
						title={platform.title}
					>
						<NotificationModal channel={platform.channel}>
							{platform.channel === ECHANNEL.TELEGRAM && (
								<Telegram
									preferences={preferences}
									onAction={async () => generateToken(ECHANNEL.TELEGRAM)}
								/>
							)}
							{platform.channel === ECHANNEL.SLACK && (
								<Slack
									address={address}
									preferences={preferences}
									onAction={async () => generateToken(ECHANNEL.SLACK)}
								/>
							)}
							{platform.channel === ECHANNEL.DISCORD && (
								<Discord
									address={address}
									preferences={preferences}
									onAction={async () => generateToken(ECHANNEL.DISCORD)}
								/>
							)}
						</NotificationModal>
						to a {platform.title} chat to get {platform.title} notifications
					</NotificationRow>
				))}

				<div className='flex items-center justify-start gap-x-2 px-4 py-2 bg-bg-secondary rounded-lg'>
					<InfoCircleOutlined className='text-waiting' />
					<Typography
						variant={ETypographyVariants.p}
						className='m-0 p-0 text-waiting text-xs flex items-center gap-x-1'
					>
						Not receiving notifications? <span className='m-0 p-0 text-primary'>Contact Us</span>
					</Typography>
				</div>
			</section>
		</div>
	);
};
