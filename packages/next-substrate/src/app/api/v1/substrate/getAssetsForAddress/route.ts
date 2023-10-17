// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { responseMessages } from '@next-common/constants/response_messages';
import { NextResponse } from 'next/server';
import isValidRequest from '../api-utils/isValidRequest';
import _getAssetsForAddress from '../api-utils/_getAssetsForAddress';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { address: addressToFetch } = await req.json();
	if (!addressToFetch || !network)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const { data: assetsArr, error: assetsError } = await _getAssetsForAddress(addressToFetch, network);
		if (assetsError || !assetsArr)
			return NextResponse.json(
				{ data: null, error: assetsError || responseMessages.assets_fetch_error },
				{ status: 400 }
			);

		// make a copy to db after response is sent
		const assetsRef = firestoreDB.collection('assets').doc(addressToFetch);
		assetsRef.set({ assets: assetsArr });

		return NextResponse.json({ data: assetsArr, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getTransactionsForMultisig :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
