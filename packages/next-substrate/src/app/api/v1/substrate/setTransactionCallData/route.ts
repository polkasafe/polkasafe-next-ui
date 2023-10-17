// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { headers } from 'next/headers';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { ApiPromise, WsProvider } from '@polkadot/api';
import decodeCallData from '@next-substrate/utils/decodeCallData';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { callHash, callData } = await req.json();
	if (!callHash || !callData || !network)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		if (!Object.values(networks).includes(network))
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

		const provider = new WsProvider(chainProperties[network].rpcEndpoint);
		const api = new ApiPromise({ provider });
		await api.isReady;

		if (!api || !api.isReady)
			return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });

		const { data, error: err } = decodeCallData(callData, api);
		if (err || !data) return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });
		if (data?.extrinsicCall?.hash.toHex() !== callHash)
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 400 });

		// is valid call data
		const txRef = firestoreDB.collection('transactions').doc(callHash);
		txRef.set({ callData: String(callData) }, { merge: true });

		return NextResponse.json({ data: null, error: responseMessages.success }, { status: 400 });
	} catch (err: unknown) {
		console.error('Error in setTransactionCallData :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
