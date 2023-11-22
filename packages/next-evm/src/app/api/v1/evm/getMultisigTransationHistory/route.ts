// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
/* eslint-disable sort-keys */

import { responseMessages } from '@next-common/constants/response_messages';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { chainProperties } from '@next-common/global/evm-network-constants';

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/no-unused-vars
export async function GET(req: Request) {
	const headersList = headers();
	const address = headersList.get('x-address');
	const network = headersList.get('x-network');

	if (!network) {
		return NextResponse.json({ data: null, error: responseMessages.missing_headers }, { status: 400 });
	}
	const chainId = chainProperties[network]?.chainId;
	if (!chainId) {
		return NextResponse.json({ data: null, error: responseMessages.invalid_network }, { status: 400 });
	}

	if (!address) {
		return NextResponse.json({ data: null, error: responseMessages.missing_headers }, { status: 400 });
	}

	const safeURL = `https://safe-client.safe.global/v1/chains/${chainId}/safes/${address}/transactions/history`;

	try {
		const { data } = await axios.get(safeURL);
		return NextResponse.json({ data, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in addTransaction :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
