/* eslint-disable sort-keys */
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

if (!process.env.NEXT_PUBLIC_POLKASAFE_FIREBASE_CONFIG_CLIENT) {
	throw new Error('Internal Error: POLKASAFE_FIREBASE_CONFIG_CLIENT missing.');
}

const config = JSON.parse(process.env.NEXT_PUBLIC_POLKASAFE_FIREBASE_CONFIG_CLIENT as string);

const firebaseConfig = {
	apiKey: config.apiKey,
	authDomain: config.authDomain,
	projectId: config.projectId,
	storageBucket: config.storageBucket,
	messagingSenderId: config.messagingSenderId,
	appId: config.appId,
	measurementId: config.measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
