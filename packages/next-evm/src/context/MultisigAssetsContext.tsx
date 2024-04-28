// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EAssetType, IAsset, INFTAsset } from '@next-common/types';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ethers } from 'ethers';
import { SafeBalanceResponse, getCollectiblesPage } from '@safe-global/safe-gateway-typescript-sdk';
import returnTxUrl from '@next-common/global/gnosisService';
import { EthersAdapter } from '@safe-global/protocol-kit';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useWallets } from '@privy-io/react-auth';
import { useActiveOrgContext } from './ActiveOrgContext';

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
	allNfts: { [multisigAddress: string]: INFTAsset[] };
	tokenFiatConversions: { [tokenAddress: string]: string };
	loadingAssets: boolean;
	setMultisigAssetsContextState: React.Dispatch<React.SetStateAction<IMultisigAssets>>;
}

export const initialMultisigAssetsContext: IMultisigAssetsContext = {
	allAssets: {},
	allNfts: {},
	loadingAssets: false,
	organisationBalance: {
		tokens: {},
		total: ''
	},
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
	const [allAssets, setAllAssets] = useState<IMultisigAssets>({});
	const [organisationBalance, setOrgBalance] = useState<IOrganisationBalance>();
	const [allNfts, setAllNfts] = useState<{ [multisigAddress: string]: INFTAsset[] }>({});
	const [tokenFiatConversions, setTokenFiatConversions] = useState<{ [tokenAddress: string]: string }>({});
	const [loading, setLoading] = useState<boolean>(false);

	const { activeOrg } = useActiveOrgContext();

	const { wallets } = useWallets();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleGetAssets = useCallback(async () => {
		if (!activeOrg) return;

		try {
			setLoading(true);
			const allMultisigs = activeOrg?.multisigs;

			const totalOrgBalance: IOrganisationBalance = {
				tokens: {},
				total: '0'
			};
			await Promise.all(
				allMultisigs.map(async (account) => {
					const txUrl = returnTxUrl(account.network as NETWORK);
					const provider = await wallets?.[0].getEthersProvider();
					const web3Adapter = new EthersAdapter({
						ethers,
						signerOrProvider: provider
					});
					const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
					const tokenInfo: SafeBalanceResponse = await gnosisService.getMultisigAllAssets(
						account.network as NETWORK,
						account.address
					);
					const nftInfo = await getCollectiblesPage(
						chainProperties[account.network].chainId.toString(),
						account.address
					);

					let fiatConversions = {};

					const assets: IAsset[] = tokenInfo?.items?.map((token: any) => {
						if (token?.tokenInfo?.type === EAssetType.NATIVE_TOKEN) {
							fiatConversions = { ...fiatConversions, [EAssetType.NATIVE_TOKEN]: token?.fiatConversion };
						} else {
							fiatConversions = { ...fiatConversions, [token?.tokenInfo?.address || '']: token?.fiatConversion };
						}
						const balance = ethers.BigNumber.from(token?.balance);
						return {
							balance_token: ethers.utils.formatUnits(
								balance.toString(),
								token?.tokenInfo?.decimals || chainProperties[account.network].decimals
							),
							balance_usd: token?.fiatBalance,
							fiat_conversion: token?.fiatConversion,
							logoURI: token?.tokenInfo?.logoUri || chainProperties[account.network]?.logo,
							name: token?.tokenInfo?.symbol || chainProperties[account.network].tokenSymbol,
							symbol: token?.tokenInfo?.name || chainProperties[account.network].tokenSymbol,
							tokenAddress: token?.tokenInfo?.address,
							token_decimals: token?.tokenInfo?.decimals || chainProperties[account.network].decimals,
							type: token?.tokenInfo?.type
						};
					});

					const nfts: INFTAsset[] =
						nftInfo.results.length > 0
							? nftInfo.results.map((nft) => ({
									imageUri: nft.imageUri,
									logoURI: nft.logoUri,
									name: nft.tokenName,
									network: account.network,
									symbol: nft.tokenSymbol,
									tokenAddress: nft.address,
									tokenId: nft.id,
									tokenNameWithID: nft.name
							  }))
							: [];

					setAllAssets((prev) => ({ ...prev, [account.address]: { assets, fiatTotal: tokenInfo.fiatTotal || '0' } }));
					setAllNfts((prev) => ({ ...prev, [account.address]: nfts }));
					setTokenFiatConversions(fiatConversions);

					const total = Number(totalOrgBalance.total) + Number(tokenInfo.fiatTotal);
					tokenInfo?.items?.forEach((item) => {
						let balanceToken = ethers.BigNumber.from('0');
						if (totalOrgBalance.tokens[item.tokenInfo.symbol]) {
							const weiValue = ethers.utils.parseUnits(
								totalOrgBalance.tokens[item.tokenInfo.symbol].balance_token,
								totalOrgBalance.tokens[item.tokenInfo.symbol].tokenDecimals
							);
							const prevValue = ethers.BigNumber.from(weiValue || 0);
							const currValue = ethers.BigNumber.from(item.balance);
							balanceToken = prevValue.add(currValue);
						} else {
							balanceToken = balanceToken.add(ethers.BigNumber.from(item.balance));
						}
						const formattedBalance = ethers.utils.formatUnits(balanceToken.toString(), item?.tokenInfo?.decimals);
						totalOrgBalance.tokens[item.tokenInfo.symbol] = {
							balance_token: formattedBalance,
							balance_usd: item.fiatBalance,
							logo: item.tokenInfo.logoUri,
							name: item.tokenInfo.name,
							tokenAddress: item.tokenInfo.address,
							tokenDecimals: item.tokenInfo.decimals,
							tokenSymbol: item.tokenInfo.symbol
						};
					});
					totalOrgBalance.total = total.toString();
					console.log('info', tokenInfo);
				})
			);

			console.log('total orgg balance', totalOrgBalance);
			setOrgBalance(totalOrgBalance);
			setLoading(false);
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeOrg, wallets]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	const value = useMemo(
		() => ({
			allAssets,
			allNfts,
			loadingAssets: loading,
			organisationBalance,
			setMultisigAssetsContextState: setAllAssets,
			tokenFiatConversions
		}),
		[allAssets, allNfts, loading, organisationBalance, tokenFiatConversions]
	);

	return <MultisigAssetsContext.Provider value={value}>{children}</MultisigAssetsContext.Provider>;
};
