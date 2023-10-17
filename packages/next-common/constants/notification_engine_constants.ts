// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// eslint-disable-next-line @typescript-eslint/naming-convention
export enum NOTIFICATION_SOURCE {
	POLKASSEMBLY = 'polkassembly',
	POLKASAFE = 'polkasafe',
	TOWNHALL = 'townhall'
}

export enum CHANNEL {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export interface IUserNotificationChannelPreferences {
	name: CHANNEL;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IUserNotificationTriggerPreferences {
	name: string;
	enabled: boolean;
	[additionalProperties: string]: any; // trigger specific properties
}

export interface IUserNotificationPreferences {
	channelPreferences: { [index: string]: IUserNotificationChannelPreferences };
	triggerPreferences: { [index: string]: IUserNotificationTriggerPreferences };
}

export const NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG: { [index in NOTIFICATION_SOURCE]: string } = {
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_FIREBASE_CONFIG || ''
};

// TODO: check TOWNHALL email
export const NOTIFICATION_SOURCE_EMAIL: { [index in NOTIFICATION_SOURCE]: string } = {
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: 'noreply@polkassembly.io',
	[NOTIFICATION_SOURCE.POLKASAFE]: 'noreply@polkasafe.xyz',
	[NOTIFICATION_SOURCE.TOWNHALL]: 'noreply@townhall.io'
};

export const TELEGRAM_BOT_TOKEN: { [index in NOTIFICATION_SOURCE]: string | undefined } = {
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_TELEGRAM_BOT_TOKEN,
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_TELEGRAM_BOT_TOKEN,
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_TELEGRAM_BOT_TOKEN
};

interface IDiscordBotSecrets {
	token: string | undefined;
	publicKey: string | undefined;
	clientId: string | undefined;
}

export const DISCORD_BOT_SECRETS: { [index in NOTIFICATION_SOURCE]: IDiscordBotSecrets } = {
	[NOTIFICATION_SOURCE.POLKASAFE]: {
		clientId: process.env.POLKASAFE_DISCORD_CLIENT_ID,
		publicKey: process.env.POLKASAFE_DISCORD_PUBLIC_KEY,
		token: process.env.POLKASAFE_DISCORD_BOT_TOKEN
	},
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: {
		clientId: process.env.POLKASSEMBLY_DISCORD_CLIENT_ID,
		publicKey: process.env.POLKASSEMBLY_DISCORD_PUBLIC_KEY,
		token: process.env.POLKASSEMBLY_DISCORD_BOT_TOKEN
	},
	[NOTIFICATION_SOURCE.TOWNHALL]: {
		clientId: process.env.TOWNHALL_DISCORD_CLIENT_ID,
		publicKey: process.env.TOWNHALL_DISCORD_PUBLIC_KEY,
		token: process.env.TOWNHALL_DISCORD_BOT_TOKEN
	}
};

export const SLACK_BOT_TOKEN: { [index in NOTIFICATION_SOURCE]: string | undefined } = {
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_SLACK_BOT_TOKEN,
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_SLACK_BOT_TOKEN,
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_SLACK_BOT_TOKEN
};

export const { NOTIFICATION_ENGINE_API_KEY } = process.env;
export const { SENDGRID_API_KEY } = process.env;
export const { ELEMENT_API_KEY } = process.env;
