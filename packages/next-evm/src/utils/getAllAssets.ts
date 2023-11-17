// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import returnTxUrl from '@next-common/global/gnosisService';
import { NETWORK } from '@next-common/global/evm-network-constants';

// of the Apache-2.0 license. See the LICENSE file for details.
const getAllAssets = async (network: NETWORK, address: string) => {
	return (
		await fetch(`${returnTxUrl(network)}/api/v1/safes/${address}/balances/usd/?trusted=true&exclude_spam=true`)
	).json();
};

export default getAllAssets;
