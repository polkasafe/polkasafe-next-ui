// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork } from '@common/enum/substrate';
import { AllNetworkApi } from '@substrate/app/atoms/api/apiAtom';
import { getApiAtomByNetwork } from '@substrate/app/global/utils/getApiAtomByNetwork';
import { useAtomValue } from 'jotai';

export function useApi() {
	const apis: AllNetworkApi = {};

	Object.values(ENetwork).forEach((network) => {
		const apiAtom = getApiAtomByNetwork(network);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const apiObject = useAtomValue(apiAtom);

		if (apiObject) {
			apis[network] = apiObject;
		}
	});
	return apis;
}
