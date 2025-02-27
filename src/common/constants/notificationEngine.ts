// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NotificationSource } from '@common/enum/substrate';
import { INotificationPreferences, ITriggerPreferences } from '@common/types/substrate';

export interface IUserNotificationPreferences {
	channelPreferences: { [index: string]: INotificationPreferences };
	triggerPreferences: { [index: string]: ITriggerPreferences };
}

export const NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG: { [index in NotificationSource]: string } = {
	[NotificationSource.POLKASSEMBLY]: process.env.POLKASSEMBLY_FIREBASE_CONFIG || '',
	[NotificationSource.POLKASAFE]: process.env.POLKASAFE_FIREBASE_CONFIG || '',
	[NotificationSource.TOWNHALL]: process.env.TOWNHALL_FIREBASE_CONFIG || ''
};

// TODO: check TOWNHALL email
export const NOTIFICATION_SOURCE_EMAIL: { [index in NotificationSource]: string } = {
	[NotificationSource.POLKASSEMBLY]: 'noreply@polkassembly.io',
	[NotificationSource.POLKASAFE]: 'noreply@polkasafe.xyz',
	[NotificationSource.TOWNHALL]: 'noreply@townhall.io'
};

export const TELEGRAM_BOT_TOKEN: { [index in NotificationSource]: string | undefined } = {
	[NotificationSource.POLKASAFE]: process.env.POLKASAFE_TELEGRAM_BOT_TOKEN,
	[NotificationSource.POLKASSEMBLY]: process.env.POLKASSEMBLY_TELEGRAM_BOT_TOKEN,
	[NotificationSource.TOWNHALL]: process.env.TOWNHALL_TELEGRAM_BOT_TOKEN
};

interface IDiscordBotSecrets {
	token: string | undefined;
	publicKey: string | undefined;
	clientId: string | undefined;
}

export const DISCORD_BOT_SECRETS: { [index in NotificationSource]: IDiscordBotSecrets } = {
	[NotificationSource.POLKASAFE]: {
		clientId: process.env.POLKASAFE_DISCORD_CLIENT_ID,
		publicKey: process.env.POLKASAFE_DISCORD_PUBLIC_KEY,
		token: process.env.POLKASAFE_DISCORD_BOT_TOKEN
	},
	[NotificationSource.POLKASSEMBLY]: {
		clientId: process.env.POLKASSEMBLY_DISCORD_CLIENT_ID,
		publicKey: process.env.POLKASSEMBLY_DISCORD_PUBLIC_KEY,
		token: process.env.POLKASSEMBLY_DISCORD_BOT_TOKEN
	},
	[NotificationSource.TOWNHALL]: {
		clientId: process.env.TOWNHALL_DISCORD_CLIENT_ID,
		publicKey: process.env.TOWNHALL_DISCORD_PUBLIC_KEY,
		token: process.env.TOWNHALL_DISCORD_BOT_TOKEN
	}
};

export const SLACK_BOT_TOKEN: { [index in NotificationSource]: string | undefined } = {
	[NotificationSource.POLKASAFE]: process.env.POLKASAFE_SLACK_BOT_TOKEN,
	[NotificationSource.POLKASSEMBLY]: process.env.POLKASSEMBLY_SLACK_BOT_TOKEN,
	[NotificationSource.TOWNHALL]: process.env.TOWNHALL_SLACK_BOT_TOKEN
};

export const { NOTIFICATION_ENGINE_API_KEY } = process.env;
export const { SENDGRID_API_KEY } = process.env;
export const { ELEMENT_API_KEY } = process.env;
