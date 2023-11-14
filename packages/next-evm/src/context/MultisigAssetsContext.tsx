// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IAsset } from '@next-common/types';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { useGlobalUserDetailsContext } from './UserDetailsContext';
import { useGlobalApiContext } from './ApiContext';

export interface IMultisigAssetsContext {
	allAssets: IAsset[];
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IAsset[]>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: [],
	setMultisigAssetsContextState: (): void => {
		throw new Error('setMultisigAssetsContextState function must be overridden');
	}
};

export const MultisigAssetsContext = createContext(initialMultisigAssetsContext);

export function useMultisigAssetsContext() {
	return useContext(MultisigAssetsContext);
}

export const MultisigAssetsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [allAssets, setAllAssets] = useState<IAsset[]>([]);

	const { activeMultisig, gnosisSafe } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const handleGetAssets = useCallback(async () => {
		try {
			const tokenInfo = await gnosisSafe.getMultisigAllAssets(network, activeMultisig);
			const assets: IAsset[] = tokenInfo.map((token: any) => ({
				balance_token: token.balance / 10 ** (token?.token?.decimals || chainProperties[network].decimals),
				balance_usd: token.fiatBalance,
				logoURI: token?.token?.logoUri || chainProperties[network].logo,
				name: token?.token?.symbol || chainProperties[network].tokenSymbol,
				tokenAddress: token?.tokenAddress,
				token_decimals: token?.token?.decimals || chainProperties[network].decimals
			}));
			setAllAssets(assets);
		} catch (error) {
			console.log('ERROR', error);
		}
	}, [activeMultisig, gnosisSafe, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	const value = useMemo(() => ({ allAssets, setMultisigAssetsContextState: setAllAssets }), [allAssets]);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
