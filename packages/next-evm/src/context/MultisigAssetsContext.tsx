// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EAssetType, IAsset, INFTAsset } from '@next-common/types';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ethers } from 'ethers';
import { getCollectiblesPage } from '@safe-global/safe-gateway-typescript-sdk';
import { useGlobalUserDetailsContext } from './UserDetailsContext';
import { useGlobalApiContext } from './ApiContext';

export interface IMultisigAssetsContext {
	allAssets: IAsset[];
	allNfts: INFTAsset[];
	tokenFiatConversions: { [tokenAddress: string]: string };
	loadingAssets: boolean;
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IAsset[]>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: [],
	allNfts: [],
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
	const [allNfts, setAllNfts] = useState<INFTAsset[]>([]);
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

			const nftInfo = await getCollectiblesPage(chainProperties[network].chainId.toString(), activeMultisig);

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

			const nfts: INFTAsset[] = nftInfo.results.map((nft) => ({
				imageUri: nft.imageUri,
				logoURI: nft.logoUri,
				name: nft.tokenName,
				symbol: nft.tokenSymbol,
				tokenAddress: nft.address,
				tokenId: nft.id,
				tokenNameWithID: nft.name
			}));

			setTokenFiatConversions(fiatConversions);

			setAllAssets(assets);
			setAllNfts(nfts);
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
		() => ({
			allAssets,
			allNfts,
			loadingAssets: loading,
			setMultisigAssetsContextState: setAllAssets,
			tokenFiatConversions
		}),
		[allAssets, allNfts, loading, tokenFiatConversions]
	);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
