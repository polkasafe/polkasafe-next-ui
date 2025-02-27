// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IUpdateDBAssetProps } from '@common/types/substrate';

// of the Apache-2.0 license. See the LICENSE file for details.
export const parseAssets = (assets: IUpdateDBAssetProps) => ({
	balanceToken: assets.balance_token,
	balanceUSD: `$ ${assets.balance_usd || 0}`,
	logoURI: assets.logoURI,
	name: assets.name,
	symbol: assets.symbol,
	multisig: assets.multisigId
});
