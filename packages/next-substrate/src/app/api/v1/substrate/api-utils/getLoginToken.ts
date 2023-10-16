// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { v4 as uuidv4 } from 'uuid';

export default function getLoginToken(): string {
	return `<Bytes>polkasafe-login-${uuidv4()}</Bytes>`;
}
