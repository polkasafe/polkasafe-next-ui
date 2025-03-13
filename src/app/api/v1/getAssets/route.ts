// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { withErrorHandling } from '@substrate/app/api/api-utils';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseMessages } from '@common/constants/responseMessage';
import { onChainAssets } from '@substrate/app/api/api-utils/onChainAssets';
import { ASSETS_COLLECTION } from '@common/db/collections';
import { IUpdateDBAssetProps } from '@common/types/substrate';
import { ENetwork } from '@common/enum/substrate';

const updateDB = async (assets: Array<IUpdateDBAssetProps>) => {
	try {
		Promise.all(
			assets.map(async (multisigAsset) =>
				ASSETS_COLLECTION.doc(multisigAsset.multisigId).set({ multisigAsset }, { merge: true })
			)
		);
	} catch (err: unknown) {
		console.log('Error in updateDB:', err);
	}
};

export const POST = withErrorHandling(async (req: NextRequest) => {
	try {
		const { multisigIds } = await req.json();
		if (!multisigIds) {
			return NextResponse.json({ error: ResponseMessages.MISSING_PARAMS }, { status: 400 });
		}
		if (!Array.isArray(multisigIds)) {
			return NextResponse.json({ error: ResponseMessages.INVALID_PARAMS }, { status: 400 });
		}

		const assets = await Promise.all(
			multisigIds.map(async (multisigId: string) => {
				const [address, network] = multisigId.split('_');
				if (!address || !network) {
					return null;
				}
				const assets = await onChainAssets(address, network as ENetwork);
				return assets.data.map((asset) => ({ ...asset, multisigId }));
			})
		);
		const assetsData = assets.filter((asset) => asset !== null).flat();
		updateDB(assetsData);
		return NextResponse.json({ data: assetsData, error: null });
	} catch (err: unknown) {
		console.log('Error in getAssets:', err);
		return NextResponse.json({ error: ResponseMessages.INTERNAL }, { status: 500 });
	}
});
