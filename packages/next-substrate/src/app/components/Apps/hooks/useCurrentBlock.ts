// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import BN from 'bn.js';
import { useEffect, useState } from 'react';

export default function useCurrentBlock() {
	const [currentBlock, setCurrentBlock] = useState<BN | undefined>(undefined);
	const { api, apiReady } = useGlobalApiContext();

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		api.derive.chain
			.bestNumber((number) => {
				setCurrentBlock(number);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		// eslint-disable-next-line consistent-return
		return () => unsubscribe && unsubscribe();
	}, [api, apiReady]);

	return currentBlock;
}
