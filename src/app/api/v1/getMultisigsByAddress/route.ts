// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { MULTISIG_COLLECTION } from '@common/db/collections';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import { onChainMultisig } from '@substrate/app/api/api-utils/onChainMultisig';
import { ENetwork, EUserType } from '@common/enum/substrate';
import { DEFAULT_MULTISIG_NAME } from '@common/constants/defaults';
import { IDBMultisig, IProxy } from '@common/types/substrate';
import { onChainMultisigsByAddress } from '@substrate/app/api/api-utils/onChainMultisigsByAddress';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { dbProxyData } from '@substrate/app/api/api-utils/dbProxyData';

const updateDB = async (docId: string, multisig: IDBMultisig) => {
	const multisigRef = await MULTISIG_COLLECTION.doc(String(docId)).get();

	if (!multisigRef.exists) {
		// if the multisig is not exists in our db, update it
		const newMultisigRef = MULTISIG_COLLECTION.doc(docId);
		await newMultisigRef.set(multisig, { merge: true });
	}
};

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { address, network } = await req.json();
		if (!address || !network) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}

		const encodedMultisigAddress = getEncodedAddress(address, network);
		if (!encodedMultisigAddress) {
			return NextResponse.json({ error: ResponseMessages.INVALID_ADDRESS });
		}

		const allMultisig: Array<IDBMultisig> = [];

		const dbData = await MULTISIG_COLLECTION.where('signatories', 'array-contains', encodedMultisigAddress)
			.where('network', '==', network)
			.get();
		if (dbData.docs.length > 0) {
			dbData.docs.forEach(async (doc) => {
				const data = doc.data() as IDBMultisig;
				allMultisig.push({ ...data });
			});
		}

		const onChainData: Array<string> = await onChainMultisigsByAddress(encodedMultisigAddress, network);

		const onchainFilteredData = onChainData.filter((address) => {
			return !allMultisig.map((a) => getSubstrateAddress(a.address)).includes(getSubstrateAddress(address));
		});

		// const data = onChainData.map(async (address) => {
		// 	const encodedAddress = getEncodedAddress(address, network) || address;
		// 	const docId = `${encodedAddress}_${network}`;
		// 	const { data: multisigMetaData, error: multisigMetaDataErr } = await onChainMultisig(encodedAddress, network);
		// 	if (multisigMetaDataErr) {
		// 		return null;
		// 	}
		// 	if (!multisigMetaData) {
		// 		return null;
		// 	}

		// 	const newMultisig: IDBMultisig = {
		// 		address: encodedAddress,
		// 		created_at: new Date(),
		// 		updated_at: new Date(),
		// 		name: DEFAULT_MULTISIG_NAME,
		// 		signatories: multisigMetaData.signatories || [],
		// 		network: String(network).toLowerCase() as ENetwork,
		// 		threshold: Number(multisigMetaData.threshold) || 0,
		// 		type: EUserType.SUBSTRATE,
		// 		proxy: multisigMetaData.proxy
		// 	};

		// 	updateDB(docId, newMultisig);
		// 	return newMultisig;
		// });
		// await Promise.all(data);

		for (const address of onchainFilteredData) {
			const encodedMultisigAddress = getEncodedAddress(address, network) || address;
			const docId = `${encodedMultisigAddress}_${network}`;
			const { data: multisigMetaData, error: multisigMetaDataErr } = await onChainMultisig(
				encodedMultisigAddress,
				network
			);
			if (multisigMetaDataErr) {
				continue;
			}
			if (!multisigMetaData) {
				continue;
			}

			const newMultisig: IDBMultisig = {
				address: encodedMultisigAddress,
				created_at: new Date(),
				updated_at: new Date(),
				name: DEFAULT_MULTISIG_NAME,
				signatories: multisigMetaData.signatories || [],
				network: String(network).toLowerCase() as ENetwork,
				threshold: Number(multisigMetaData.threshold) || 0,
				type: EUserType.SUBSTRATE,
				proxy: multisigMetaData.proxy
			};

			updateDB(docId, newMultisig);
			allMultisig.push(newMultisig);
		}

		// await Promise.all(allMultisig);
		const multisigData = await Promise.all(
			allMultisig.map(async (multisig) => {
				const docId = `${multisig.address}_${multisig.network}`;
				const proxyData = (await dbProxyData(docId)) as Array<IProxy>;

				multisig.proxy = (multisig.proxy || [])?.map((item1) => {
					const match = proxyData?.find?.((item2) => item2.address === item1.address);
					if (match) {
						item1.name = match.name; // Update name with the name from array2
					}
					return item1;
				});
				return multisig;
			})
		);

		return NextResponse.json(
			{
				data: multisigData,
				error: null
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error(err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
