// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as admin from 'firebase-admin';
import {
	NOTIFICATION_SOURCE,
	NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG
} from '@next-common/constants/notification_engine_constants';

export default function getSourceFirebaseAdmin(source: NOTIFICATION_SOURCE) {
	if (!NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source])
		throw new Error(`No firebase admin config found in env for source: ${source}`);

	// check if app is already initialized for source
	if (admin.apps.length > 1) {
		const app = admin.apps.find((a) => a?.name === source);
		if (app) {
			return {
				firebase_admin: app,
				firestore_db: app.firestore()
			};
		}
	}

	const firebase_admin = admin.initializeApp(
		{
			credential: admin.credential.cert(
				JSON.parse(NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG[source]) as admin.ServiceAccount
			)
		},
		source
	);

	const firestore_db = firebase_admin.firestore();
	return { firebase_admin, firestore_db };
}
