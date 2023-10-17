// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { headers } from 'next/headers';
import { encodeAddress } from '@polkadot/util-crypto';
import { firestoreDB } from '@next-substrate/utils/firebaseInit';
import { NextResponse } from 'next/server';
import { responseMessages } from '@next-common/constants/response_messages';
import { chainProperties } from '@next-common/global/networkConstants';
import { IMultisigAddress } from '@next-common/types';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import isValidRequest from '../api-utils/isValidRequest';
import getOnChainMultisigMetaData from '../api-utils/getOnChainMultisigMetaData';

// eslint-disable-next-line import/prefer-default-export, sonarjs/cognitive-complexity
export async function POST(req: Request) {
	const headerList = headers();
	const signature = headerList.get('x-signature');
	const address = headerList.get('x-address');
	const network = String(headerList.get('x-network'));

	const { isValid, error } = await isValidRequest(address, signature, network);
	if (!isValid) return NextResponse.json({ data: null, error }, { status: 400 });

	const { multisigAddress } = await req.json();
	if (!multisigAddress || !network) {
		return NextResponse.json({ data: null, error: responseMessages.missing_params }, { status: 400 });
	}

	try {
		const encodedMultisigAddress = encodeAddress(multisigAddress, chainProperties[network].ss58Format);
		// check if the multisig already exists in our db
		const multisigRef = await firestoreDB
			.collection('multisigAddresses')
			.doc(String(`${encodedMultisigAddress}_${network}`))
			.get();
		if (multisigRef.exists) {
			const data = multisigRef.data();
			return NextResponse.json(
				{
					data: {
						...data,
						created_at: data?.created_at.toDate(),
						updated_at: data?.updated_at?.toDate() || data?.created_at.toDate()
					},
					error: null
				},
				{ status: 200 }
			);
		}

		const { data: multisigMetaData, error: multisigMetaDataErr } = await getOnChainMultisigMetaData(
			encodedMultisigAddress,
			network
		);
		if (multisigMetaDataErr)
			return NextResponse.json(
				{ data: null, error: multisigMetaDataErr || responseMessages.onchain_multisig_fetch_error },
				{ status: 400 }
			);
		if (!multisigMetaData)
			return NextResponse.json({ data: null, error: responseMessages.multisig_not_found_on_chain }, { status: 400 });

		const newMultisig: IMultisigAddress = {
			address: encodedMultisigAddress,
			created_at: new Date(),
			updated_at: new Date(),
			name: DEFAULT_MULTISIG_NAME,
			signatories: multisigMetaData.signatories || [],
			network: String(network).toLowerCase(),
			threshold: Number(multisigMetaData.threshold) || 0
		};
		if (newMultisig.signatories.length > 1 && newMultisig.threshold) {
			// make a copy to db
			const newMultisigRef = firestoreDB.collection('multisigAddresses').doc(`${encodedMultisigAddress}_${network}`);
			await newMultisigRef.set(newMultisig);
		}

		return NextResponse.json({ data: newMultisig, error: null }, { status: 200 });
	} catch (err: unknown) {
		console.error('Error in getMultisigByMultisigAddress :', { err, stack: (err as any).stack });
		return NextResponse.json({ data: null, error: responseMessages.internal }, { status: 500 });
	}
}
