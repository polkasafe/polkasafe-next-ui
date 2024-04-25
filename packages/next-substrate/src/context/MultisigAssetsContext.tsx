// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IAsset } from '@next-common/types';
import getAssetsForAddress from '@next-substrate/utils/getAssetsForAddress';
import { useActiveOrgContext } from './ActiveOrgContext';
import { useGlobalCurrencyContext } from './CurrencyContext';

interface IOrganisationBalance {
	total: string;
	tokens: {
		[tokenSymbol: string]: {
			name: string;
			tokenSymbol: string;
			balance_token: string;
			tokenAddress?: string;
			tokenDecimals: number;
			logo: string;
			balance_usd: string;
		};
	};
}

export interface IMultisigAssets {
	[multisigAddress: string]: {
		fiatTotal: string;
		assets: IAsset[];
	};
}

export interface IMultisigAssetsContext {
	organisationBalance: IOrganisationBalance;
	allAssets: IMultisigAssets;
	loadingAssets: boolean;
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IMultisigAssets>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: {},
	loadingAssets: false,
	organisationBalance: {
		tokens: {},
		total: ''
	},
	setMultisigAssetsContextState: (): void => {
		throw new Error('setMultisigAssetsContextState function must be overridden');
	}
};

export const MultisigAssetsContext = createContext(initialMultisigAssetsContext);

export function useMultisigAssetsContext() {
	return useContext(MultisigAssetsContext);
}

export const MultisigAssetsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [allAssets, setAllAssets] = useState<IMultisigAssets>({});
	const [organisationBalance, setOrgBalance] = useState<IOrganisationBalance>();
	const [loading, setLoading] = useState<boolean>(true);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [dataLoaded, setDataLoaded] = useState<boolean>(false);

	const { activeOrg } = useActiveOrgContext();

	const { tokensUsdPrice } = useGlobalCurrencyContext();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleGetAssets = useCallback(async () => {
		if (!activeOrg || !activeOrg.id || !activeOrg.multisigs) {
			return;
		}

		try {
			setLoading(true);
			const allMultisigs = activeOrg?.multisigs;

			const totalOrgBalance: IOrganisationBalance = {
				tokens: {},
				total: '0'
			};

			let counter = 0;
			// eslint-disable-next-line no-restricted-syntax
			for (const account of allMultisigs) {
				// eslint-disable-next-line no-await-in-loop
				const { data, error } = await getAssetsForAddress(
					account.address,
					account.network,
					parseFloat(tokensUsdPrice[account.network]?.value?.toString())?.toFixed(2)
				);

				if (data && !error) {
					const fiatTotal = data.reduce((sum, item) => {
						return sum + Number(item.balance_usd);
					}, 0);
					setAllAssets((prev) => ({
						...prev,
						[account.address]: { assets: data, fiatTotal: String(fiatTotal) }
					}));
				}

				const total = Number(totalOrgBalance.total) + Number(data.reduce((t, item) => t + Number(item.balance_usd), 0));
				data?.forEach((item) => {
					let balanceToken = 0;
					let balanceUSD = 0;
					if (totalOrgBalance.tokens[item.symbol]) {
						balanceToken = Number(totalOrgBalance.tokens[item.symbol].balance_token) + Number(item.balance_token);
						balanceUSD = Number(totalOrgBalance.tokens[item.symbol].balance_usd) + Number(item.balance_usd);
					} else {
						balanceToken += Number(item.balance_token);
						balanceUSD += Number(item.balance_usd);
					}
					totalOrgBalance.tokens[item.symbol] = {
						balance_token: balanceToken.toString(),
						balance_usd: balanceUSD.toString(),
						logo: item.logoURI,
						name: item.name,
						tokenAddress: item.tokenAddress || '',
						tokenDecimals: item.token_decimals,
						tokenSymbol: item.symbol
					};
				});
				totalOrgBalance.total = total.toString();
				counter += 1;
			}

			setOrgBalance(totalOrgBalance);
			setLoading(false);
			if (counter === allMultisigs.length) {
				setDataLoaded(true);
			}
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeOrg, tokensUsdPrice]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	const value = useMemo(
		() => ({
			allAssets,
			loadingAssets: loading,
			organisationBalance,
			setMultisigAssetsContextState: setAllAssets
		}),
		[allAssets, loading, organisationBalance]
	);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
