// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAsset, IOrganisation } from '@common/types/substrate';
import { getOrganisationById } from '@sdk/polkasafe-sdk/src/get-organisation-by-id';
import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';

// const parseMultisig = (multisig: any) =>
// ({
// name: multisig.name,
// address: multisig.address,
// threshold: multisig.threshold,
// signatories: multisig.signatories,
// balance: multisig.balance,
// disabled: multisig.disabled,
// network: multisig.network,
// createdAt: multisig.created_at,
// updatedAt: multisig.updated_at,
// proxy: multisig.proxy || []
// }) as IMultisig;

// Total Balance - Done
// last 24 hours transactions money
// With Currency - Done
// All Assets - Done
// Transactions (Queue, History)

// const parseAssets = (assets: {
// balance_token: string;
// balance_usd: string;
// logoURI: string;
// name: string;
// symbol: string;
// }) => ({
// balanceToken: assets?.balance_token || '0',
// balanceUSD: assets?.balance_usd || '0',
// logoURI: assets?.logoURI || '',
// name: assets?.name || '',
// symbol: assets?.symbol || ''
// });

export const getAllBalance = (assets: Array<IAsset>) => {
	return assets.reduce((acc, asset) => {
		return acc + parseFloat(asset.balanceUSD || '0');
	}, 0);
};

export const getOrganisationData = async (organisationId: string) => {
	const user = getUserFromCookie();
	if (!user?.address || !user?.signature) {
		return { error: ERROR_MESSAGES.USER_NOT_LOGGED_IN };
	}
	const organisationPromise = getOrganisationById({
		address: user.address,
		signature: user.signature,
		organisationId
	}) as Promise<{ data: IOrganisation }>;

	const [organisationData] = await Promise.all([organisationPromise]);

	return { organisationData: organisationData.data };
};
