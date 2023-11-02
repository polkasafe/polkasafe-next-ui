// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { resolve } from 'path';
import { NOTIFICATION_SOURCE } from '@next-common/constants/notification_engine_constants';

export default async function callNotificationTrigger(source: NOTIFICATION_SOURCE, trigger: string, args?: any) {
	const triggerModulePath = resolve(__dirname, '..', `${source}`, `${trigger}`);
	try {
		const { default: defaultExport } = await import(triggerModulePath);
		if (typeof defaultExport === 'function') {
			console.log('calling trigger ', trigger, 'with args ', args);
			await defaultExport(args);
		} else {
			throw new Error(`${trigger} is not a trigger module function`);
		}
	} catch (e: any) {
		throw new Error(`Error in notification trigger module ${triggerModulePath}: ${e.message}`);
	}
}
