// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAsset, IResponse, IUpdateDBAssetProps } from '@common/types/substrate';
import { getAssets } from '@sdk/polkasafe-sdk/src';
import { parseAssets } from '@substrate/app/(Main)/assets/ssr-actions/utils/parseAssets';

export const getMultisigAssets = async (address: string, network: string) => {
	const multisigIds = [`${address}_${network}`];
	const { data: assets, error } = (await getAssets({ multisigIds })) as IResponse<Array<IUpdateDBAssetProps>>;

	if (error) {
		return { assets: [] as Array<IAsset>, error };
	}

	return { assets: assets.map(parseAssets) as Array<IAsset>, error: null };
};
