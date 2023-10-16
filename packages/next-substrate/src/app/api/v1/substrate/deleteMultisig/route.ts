// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { headers } from 'next/headers';

import { encodeAddress } from '@polkadot/util-crypto';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { responseMessages } from '@next-common/constants/response_messages';
import { NextResponse } from 'next/server';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigSettings } from '@next-common/types';
import isValidRequest from '../api-utils/isValidRequest';

// eslint-disable-next-line import/prefer-default-export
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { multisigAddress } = await req.json();
	if (!multisigAddress)
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });

	try {
		const substrateAddress = getSubstrateAddress(String(address));
		const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);

		const newMultisigSettings: IMultisigSettings = {
			deleted: true,
			name: DEFAULT_MULTISIG_NAME
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

		console.info('Deleted multisig ', encodedMultisigAddress, ' for user ', substrateAddress);
		return NextResponse.json({ data: responseMessages.success, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in deleteMultisig :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
