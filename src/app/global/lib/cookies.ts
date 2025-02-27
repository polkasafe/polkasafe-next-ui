// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ICookieUser } from '@common/types/substrate';
import { cookies } from 'next/headers';
import { deepParseJson } from 'deep-parse-json';

export const getUserFromCookie = () => {
	const stringifyUser = cookies().get('__session');
	if (!stringifyUser) return null;
	const user = deepParseJson(stringifyUser.value);
	return user as ICookieUser;
};
