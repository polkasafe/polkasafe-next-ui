// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { firestoreDB } from '@next-evm/utils/firebaseInit';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import verifyEthSignature from '@next-common/utils/verifyEthSignature';
import { ISharedAddressBookRecord, ISharedAddressBooks } from '@next-common/types';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headersList = headers();
	const address = headersList.get('x-address');
	const signature = headersList.get('x-signature');
	const network = headersList.get('x-network');

	if (!signature || !address) {
		return NextResponse.json({ data: null, error: responseMessages.missing_headers }, { status: 400 });
	}
	const docId = `${address}_${network}`;
	const addressRef = firestoreDB.collection('addresses').doc(docId);
	const doc = await addressRef.get();
	let token = '';

	if (doc.exists) {
		const data = doc.data();
		token = data?.token;
	}
	const isValid = await verifyEthSignature(address, signature, token);
	if (!isValid) return NextResponse.json({ data: null, error: responseMessages.invalid_signature }, { status: 400 });

	const multisigColl = firestoreDB.collection('multisigAddresses');

	const { signatories, threshold, multisigName, safeAddress, disabled, addressBook } = await req.json();

	if (!signatories || !threshold || !multisigName || !safeAddress) {
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	}
	if (!Array.isArray(signatories) || signatories.length < 1)
		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

	if (Number.isNaN(threshold) || Number(threshold) > signatories.length) {
		return NextResponse.json({ data: null, error: responseMessages.invalid_threshold }, { status: 400 });
	}

	// check if signatories contain duplicate addresses
	if (new Set(signatories).size !== signatories.length)
		return NextResponse.json({ data: null, error: responseMessages.duplicate_signatories }, { status: 400 });

	const multisigDoc = await multisigColl.doc(safeAddress).get();

	const addressRefData = doc.data();

	if (multisigDoc.exists) {
		if (addressRefData && !addressRefData?.multisigAddresses?.some((item: any) => item.address === safeAddress)) {
			addressRef.update({
				multisigAddresses: [...addressRefData.multisigAddresses, multisigDoc.data()],
				[`multisigSettings.${safeAddress}`]: {
					name: multisigName
				}
			});
			return NextResponse.json({ data: multisigDoc.data(), error: null }, { status: 200 });
		}
		if (addressRefData?.multisigSettings?.[safeAddress]?.deleted) {
			addressRef.update({
				[`multisigSettings.${safeAddress}`]: {
					deleted: false,
					name: multisigName
				}
			});
			return NextResponse.json({ data: multisigDoc.data(), error: null }, { status: 200 });
		}

		return NextResponse.json({ data: null, error: responseMessages.address_already_exists }, { status: 400 });
	}
	const multisigDocument = {
		address: safeAddress,
		created_at: new Date(),
		disabled: disabled || false,
		name: multisigName,
		network,
		signatories,
		threshold,
		updated_at: new Date()
	};
	await multisigColl.doc(safeAddress).set(multisigDocument);

	await addressRef.update({
		multisigAddresses: [...addressRefData.multisigAddresses, multisigDocument],
		[`multisigSettings.${safeAddress}`]: {
			name: multisigName
		}
	});

	if (addressBook) {
		const addressBookRef = firestoreDB.collection('addressBooks').doc(`${safeAddress}_${network}`);
		const records: { [address: string]: ISharedAddressBookRecord } = {} as any;
		signatories.forEach((signatory) => {
			records[signatory] = {
				name: addressBook[signatory]?.name || '',
				address: signatory,
				created_at: addressBook[signatory]?.created_at || new Date(),
				updated_at: addressBook[signatory]?.updated_at || new Date(),
				updatedBy: addressBook[signatory]?.updatedBy || address,
				email: addressBook[signatory]?.email || '',
				discord: addressBook[signatory]?.discord || '',
				telegram: addressBook[signatory]?.telegram || '',
				roles: addressBook[signatory]?.roles || []
			};
		});
		const updatedAddressEntry: ISharedAddressBooks = {
			records,
			multisig: safeAddress
		};

		await addressBookRef.set({ ...updatedAddressEntry }, { merge: true });
	}

	return NextResponse.json({ data: multisigDocument, error: null }, { status: 200 });
}
