// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms

import getSubstrateAddress from '@common/utils/getSubstrateAddress';

// of the Apache-2.0 license. See the LICENSE file for details.
export const isValidAddress = (address: string) => {
	return getSubstrateAddress(address) !== null;
};
