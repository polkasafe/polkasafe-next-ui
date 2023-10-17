// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { encodeAddress } from '@polkadot/util-crypto';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { IMultisigAddress, IMultisigSettings } from '@next-common/types';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { chainProperties } from '@next-common/global/networkConstants';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { address: mutisigAddress, name } = await req.json();
	if (!mutisigAddress || !name)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const encodedMultisigAddress = encodeAddress(mutisigAddress, chainProperties[network].ss58Format);

		const multisigDocData = (
			await firestoreDB.collection('multisigAddresses').doc(`${encodedMultisigAddress}_${network}`).get()
		).data() as IMultisigAddress;

		if (multisigDocData.signatories.includes(substrateAddress)) {
			const newMultisigSettings: IMultisigSettings = {
				deleted: false,
				name
			};

			// delete multisig for user
			firestoreDB
				.collection('addresses')
				.doc(substrateAddress)
				.set(
					{
						multisigSettings: {
							[`${encodedMultisigAddress}_${network}`]: newMultisigSettings
						}
					},
					{ merge: true }
				);
		} else {
			return NextResponse.json({ data: null, error: responseMessages.invalid_params }, { status: 403 });
		}

		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in renameMultisig :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
