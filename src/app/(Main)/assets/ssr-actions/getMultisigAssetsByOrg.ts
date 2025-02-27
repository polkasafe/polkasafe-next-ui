// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAsset, IResponse, IUpdateDBAssetProps } from '@common/types/substrate';
import { getAssets, getMultisigsByOrganisation } from '@sdk/polkasafe-sdk/src';
import { parseAssets } from '@substrate/app/(Main)/assets/ssr-actions/utils/parseAssets';
import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';

export const getMultisigAssetsByOrg = async (orgId: string) => {
	const user = getUserFromCookie();
	if (!user?.address || !user?.signature) {
		return { assets: [] as Array<IAsset>, error: ERROR_MESSAGES.USER_NOT_LOGGED_IN };
	}
	const { data: multisigIds, error: multisigError } = (await getMultisigsByOrganisation({
		address: user.address,
		signature: user.signature,
		organisationId: orgId
	})) as { data: Array<string>; error: string };

	if (!multisigIds?.length || multisigError) {
		return { assets: [] as Array<IAsset>, error: multisigError || ERROR_MESSAGES.NO_MULTISIG_FOUND };
	}

	const { data: assets, error } = (await getAssets({ multisigIds })) as IResponse<Array<IUpdateDBAssetProps>>;

	if (error) {
		return { assets: [] as Array<IAsset>, error };
	}

	return { assets: assets.map(parseAssets) as Array<IAsset>, error: null };
};
