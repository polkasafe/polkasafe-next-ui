// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import nextApiClientFetch from './nextApiClientFetch';

// of the Apache-2.0 license. See the LICENSE file for details.
const getConnectAddressToken = async (address: string) => {
	return nextApiClientFetch('api/v1/substrate/auth/getConnectAddressToken', {}, { address });
};

export default getConnectAddressToken;
