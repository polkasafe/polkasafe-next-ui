// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import { IUser } from '@next-common/types';

// of the Apache-2.0 license. See the LICENSE file for details.
const getConnectAddressToken = async (address: string) => {
	const loginRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress_substrate`, {
		headers: firebaseFunctionsHeader(address),
		method: 'POST'
	});
	return (await loginRes.json()) as {
		data: IUser;
		error: string;
	};
};

export default getConnectAddressToken;
