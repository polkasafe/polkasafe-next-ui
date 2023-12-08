// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EAssetType, IAsset } from '@next-common/types';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ethers } from 'ethers';
import { useGlobalUserDetailsContext } from './UserDetailsContext';
import { useGlobalApiContext } from './ApiContext';

export interface IMultisigAssetsContext {
	allAssets: IAsset[];
	tokenFiatConversions: { [tokenAddress: string]: string };
	loadingAssets: boolean;
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IAsset[]>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: [],
	loadingAssets: false,
	setMultisigAssetsContextState: (): void => {
		throw new Error('setMultisigAssetsContextState function must be overridden');
	},
	tokenFiatConversions: {}
};

export const MultisigAssetsContext = createContext(initialMultisigAssetsContext);

export function useMultisigAssetsContext() {
	return useContext(MultisigAssetsContext);
}

export const MultisigAssetsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [allAssets, setAllAssets] = useState<IAsset[]>([]);
	const [tokenFiatConversions, setTokenFiatConversions] = useState<{ [tokenAddress: string]: string }>({});
	const [loading, setLoading] = useState<boolean>(false);

	const { activeMultisig, gnosisSafe, isSharedSafe, sharedSafeNetwork, sharedSafeAddress } =
		useGlobalUserDetailsContext();
	const { network: defaultNetwork } = useGlobalApiContext();

	const handleGetAssets = useCallback(async () => {
		try {
			const shared = sharedSafeAddress === activeMultisig;
			const network =
				isSharedSafe && sharedSafeNetwork && Object.values(NETWORK).includes(sharedSafeNetwork) && shared
					? sharedSafeNetwork
					: defaultNetwork;
			setLoading(true);
			const tokenInfo = await gnosisSafe.getMultisigAllAssets(network, activeMultisig);

			let fiatConversions = {};

			const assets: IAsset[] = tokenInfo.map((token: any) => {
				if (token?.tokenInfo?.type === EAssetType.NATIVE_TOKEN) {
					fiatConversions = { ...fiatConversions, [EAssetType.NATIVE_TOKEN]: token?.fiatConversion };
				} else {
					fiatConversions = { ...fiatConversions, [token?.tokenInfo?.address || '']: token?.fiatConversion };
				}
				return {
					balance_token: ethers.utils.formatUnits(
						token?.balance,
						token?.tokenInfo?.decimals || chainProperties[network].decimals
					),
					balance_usd: token?.fiatBalance,
					fiat_conversion: token?.fiatConversion,
					logoURI: token?.tokenInfo?.logoUri || chainProperties[network].logo,
					name: token?.tokenInfo?.symbol || chainProperties[network].tokenSymbol,
					symbol: token?.tokenInfo?.name || chainProperties[network].tokenSymbol,
					tokenAddress: token?.tokenInfo?.address,
					token_decimals: token?.tokenInfo?.decimals || chainProperties[network].decimals,
					type: token?.tokenInfo?.type
				};
			});

			setTokenFiatConversions(fiatConversions);

			setAllAssets(assets);
			setLoading(false);
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, defaultNetwork, gnosisSafe, isSharedSafe, sharedSafeAddress, sharedSafeNetwork]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	const value = useMemo(
		() => ({ allAssets, loadingAssets: loading, setMultisigAssetsContextState: setAllAssets, tokenFiatConversions }),
		[allAssets, loading, tokenFiatConversions]
	);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
