// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION } from '@common/db/collections';
import { IDBMultisig } from '@common/types/substrate';
import { isValidRequest } from '@common/utils/isValidRequest';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { onChainProxy } from '@substrate/app/api/api-utils/onChainProxy';
import getEncodedAddress from '@common/utils/getEncodedAddress';

const updateDB = async ({
	address: addressProps,
	network,
	proxy
}: {
	address: string;
	network: string;
	proxy: string;
}) => {
	try {
		const address = getEncodedAddress(addressProps, network);
		const docId = `${address}_${network}`;
		const docRef = MULTISIG_COLLECTION.doc(docId);
		const doc = await docRef.get();
		if (!doc.exists) {
			return;
		}
		const oldData = doc.data() as IDBMultisig;
		const proxyPayload = oldData.proxy || [];

		proxyPayload.push({ address: proxy, name: '' });

		await docRef.set({ proxy: proxyPayload }, { merge: true });
		return { ...oldData, proxy: proxyPayload };
	} catch (err: unknown) {
		console.log('Error in updateDB on create Proxy:', err);
	}
};

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { headers } = req;
	const address = headers.get('x-address');
	const signature = headers.get('x-signature');
	try {
		// check if address is valid
		const substrateAddress = getSubstrateAddress(String(address));
		if (!substrateAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		// check if signature is valid
		const { isValid, error } = await isValidRequest(substrateAddress, signature);
		if (!isValid) return NextResponse.json({ error }, { status: 400 });

		const { multisigAddress, network } = await req.json();

		if (!multisigAddress) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const proxy = await onChainProxy(multisigAddress, network);
		if (!proxy) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}
		const payload = {
			address: multisigAddress,
			network,
			proxy
		};
		const data = await updateDB(payload);
		return NextResponse.json({ data, error: null });
	} catch (err: unknown) {
		console.log('Error in create proxy:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
