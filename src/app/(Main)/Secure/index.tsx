// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LOGIN_URL } from '@substrate/app/global/end-points';
import { getUserFromCookie } from '@substrate/app/global/lib/cookies';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default function Secure({ children, organisation }: PropsWithChildren<{ organisation?: string }>) {
	const user = getUserFromCookie();
	if (!user) {
		redirect(LOGIN_URL);
	}
	return children;
}
