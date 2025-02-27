// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as firebaseAdmin from 'firebase-admin';
import { deepParseJson } from 'deep-parse-json';
import { POLKASAFE_FIREBASE_CONFIG } from '../envs';

if (!POLKASAFE_FIREBASE_CONFIG) {
	throw new Error('Internal Error: POLKASAFE_FIREBASE_CONFIG missing.');
}

const initializeFirebase = (key: any) => {
	if (firebaseAdmin.apps.length > 0) {
		return firebaseAdmin.app();
	}
	return firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(key)
	});
};

const serviceAccount = deepParseJson(POLKASAFE_FIREBASE_CONFIG) as firebaseAdmin.ServiceAccount;

const app = initializeFirebase(serviceAccount);
const DB = firebaseAdmin.firestore(app);
export { DB, firebaseAdmin as ADMIN };
