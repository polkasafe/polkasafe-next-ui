// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IAsset } from '@next-common/types';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { ethers } from 'ethers';
import { useGlobalUserDetailsContext } from './UserDetailsContext';
import { useGlobalApiContext } from './ApiContext';

export interface IMultisigAssetsContext {
	allAssets: IAsset[];
	loadingAssets: boolean;
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IAsset[]>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: [],
	loadingAssets: false,
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
	const [loading, setLoading] = useState<boolean>(false);

	const { activeMultisig, gnosisSafe } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleGetAssets = useCallback(async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const fetchTokenPrice = async (contractAddresses: string[]) => {
			const addresses = contractAddresses.length > 1 ? contractAddresses.join(',') : contractAddresses[0];
			console.log(chainProperties[network].coingeckoId);
			const data = await fetch(
				`https://api.coingecko.com/api/v3/simple/token_price/${chainProperties[network].coingeckoId}?contract_addresses=${addresses}&vs_currencies=usd&x_cg_demo_api_key=CG-N6AKA6gXHJdZRCzwzkug1JR9`,
				{ method: 'GET' }
			);

			return data.json();
		};

		try {
			setLoading(true);
			const tokenInfo = await gnosisSafe.getMultisigAllAssets(network, activeMultisig);

			console.log('token', tokenInfo);

			const assets: IAsset[] = tokenInfo.map((token: any) => {
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
					tokenAddress: token?.tokenInfo?.tokenAddress,
					token_decimals: token?.tokenInfo?.decimals || chainProperties[network].decimals
				};
			});

			console.log(assets);
			setAllAssets(assets);
			setLoading(false);
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, gnosisSafe, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	const value = useMemo(
		() => ({ allAssets, loadingAssets: loading, setMultisigAssetsContextState: setAllAssets }),
		[allAssets, loading]
	);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
