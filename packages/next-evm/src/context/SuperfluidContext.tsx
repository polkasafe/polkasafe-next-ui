// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable no-tabs */

'use client';

import { chainProperties } from '@next-common/global/evm-network-constants';
import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';
import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { useGlobalApiContext } from './ApiContext';

export interface ISuperfluidContext {
	superfluidFramework: Framework;
}

export const initialSuperfluidContext: ISuperfluidContext = {
	superfluidFramework: {} as Framework
};

export const SuperfluidContext = createContext(initialSuperfluidContext);

export function useSuperfluidContext() {
	return useContext(SuperfluidContext);
}

export const SuperfluidProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [superfluidFramework, setSuperfluidFramework] = useState<Framework>();

	const { network } = useGlobalApiContext();

	useEffect(() => {
		const initializeFramework = async () => {
			const provider = typeof window !== 'undefined' && new ethers.providers.Web3Provider(window.ethereum);
			await provider.send('eth_requestAccounts', []);

			const { chainId } = chainProperties[network];

			const sf = await Framework.create({
				chainId: Number(chainId),
				provider
			});
			setSuperfluidFramework(sf);
		};
		initializeFramework();
	}, [network]);

	const value = useMemo(
		() => ({
			superfluidFramework
		}),
		[superfluidFramework]
	);

	return <SuperfluidContext.Provider value={value}>{children}</SuperfluidContext.Provider>;
};
