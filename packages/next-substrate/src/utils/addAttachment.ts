// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SUBSTRATE_API_URL } from '@next-common/global/apiUrls';
import nextApiClientFetch from './nextApiClientFetch';

export default async function addAttachment({
	callHash,
	subfield,
	file
}: {
	callHash: string;
	subfield: string;
	file: any;
}): Promise<{ data?: { url: string }; error: string } | any> {
	const bodyContent = new FormData();
	bodyContent.append('tx_hash', callHash);
	bodyContent.append('field_key', subfield);
	bodyContent.append('file', file);

	return nextApiClientFetch<any>(`${SUBSTRATE_API_URL}/addAttachment`, bodyContent);
}
