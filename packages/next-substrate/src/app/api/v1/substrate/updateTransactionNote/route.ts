// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { encodeAddress } from '@polkadot/util-crypto';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { IMultisigAddress, ITransaction } from '@next-common/types';
import { chainProperties } from '@next-common/global/networkConstants';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { callHash, multisigAddress, note } = await req.json();
	if (!callHash || !note)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));

		const txRef = firestoreDB.collection('transactions').doc(callHash);
		const txDoc = await txRef.get();
		const txDocData = txDoc.data() as ITransaction;

		if (txDoc.exists && txDocData.from === substrateAddress) {
			txRef.update({ note: String(note) });
			return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
		}

		const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

		if (!encodedMultisigAddress && !txDoc.exists)
			return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

		// get signatories for multisig
		const multisigAddressDoc = await firestoreDB
			.collection('multisigAddresses')
			.doc(txDoc.exists && txDocData.from ? `${txDocData.from}_${network}` : `${encodedMultisigAddress}_${network}`)
			.get();

		if (
			multisigAddressDoc.exists &&
			(multisigAddressDoc.data() as IMultisigAddress).signatories.includes(substrateAddress)
		) {
			txRef.set({ callHash, note: String(note) }, { merge: true });
			return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
		}

		return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in updateTransactionNote :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
