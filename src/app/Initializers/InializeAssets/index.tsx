// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useSetAtom } from 'jotai/react';
import { useEffect } from 'react';
import { assetsAtom } from '@substrate/app/atoms/assets/assetsAtom';
// import axios from 'axios';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
// import { ENetwork } from '@common/enum/substrate';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import axios from 'axios';
import { useAllCurrencyPrice } from '@substrate/app/atoms/currency/currencyAtom';
import { ENetwork } from '@common/enum/substrate';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import { ApiPromise } from '@polkadot/api';
import { ApiPromise as AvailApiPromise } from 'avail-js-sdk';

const getTokenBalance = async (api: ApiPromise | AvailApiPromise, address: string, network: ENetwork) => {
	const parseAssets = (balance: any, decimal: number) => {
		return formatBalance(
			balance?.balance,
			{
				numberAfterComma: 3,
				withThousandDelimitor: true
			},
			network,
			decimal
		);
	};

	const tokens = (networkConstants[network] as any).supportedTokens || [];

	const tokenData = tokens.map(async (token: any) => {
		const balance = await api.query.assets.account(token.id, getEncodedAddress(address, network));
		const data = parseAssets(balance.toHuman(), token.decimals);
		return {
			free: data,
			symbol: token.symbol
		};
	});
	return Promise.all(tokenData);
};

function InitializeAssets() {
	const [organisation] = useOrganisation();
	const { getApi } = useAllAPI();
	const setAtom = useSetAtom(assetsAtom);
	const [allCurrencyData, setAllCurrencyData] = useAllCurrencyPrice();

	useEffect(() => {
		if (!organisation) {
			return;
		}
		const handleOrganisationAssets = async () => {
			if (!organisation) {
				return;
			}
			let currencyData = allCurrencyData;
			if (!currencyData) {
				const {
					data: { data }
				} = await axios.get(window.location.origin + '/api/v1/currencyData');
				setAllCurrencyData(data);
				currencyData = data;
			}

			const { multisigs } = organisation;
			const assetsPromise = multisigs.map(async (m) => {
				const { address, network, proxy } = m;
				const networkApi = getApi(network);
				if (!networkApi) {
					return null;
				}
				const { api, apiReady } = networkApi;
				if (!api || !apiReady) {
					return null;
				}
				const { data: balanceWithDecimals } = (await api.query.system.account(address)) as unknown as {
					data: any;
				};
				const balance = {} as any;

				if (network === ENetwork.POLKADOT_ASSETHUB || network === ENetwork.ROCOCO_ASSETHUB) {
					const tokenData = await getTokenBalance(api, address, network);
					tokenData.map((t) => {
						const currencies = currencyData?.[String(t.symbol).toLowerCase()] || {};
						balance[String(t.symbol).toLowerCase()] = { ...t, ...currencies };
					});
				}

				// eslint-disable-next-line no-restricted-syntax
				for (const [key, value] of Object.entries(JSON.parse(JSON.stringify(balanceWithDecimals.toHuman())))) {
					balance[key] = formatBalance(
						String(value),
						{
							numberAfterComma: 3,
							withThousandDelimitor: true
						},
						network
					);
				}
				const usdValue = Number(currencyData?.[network]?.usd || 0) * Number(balance.free);
				const allCurrency: any = {};
				Object.keys(currencyData).map((network) => {
					const allCurrencyValue: any = {};
					Object.keys(currencyData?.[network] || {}).map((currency) => {
						allCurrencyValue[currency] = Number(currencyData?.[network]?.[currency] || 0) * Number(balance.free);
					});
					allCurrency[network] = allCurrencyValue;
				});
				const proxyAssetsPromise = (proxy || []).map(async (p) => {
					const { address: proxyAddress } = p;
					const { data: proxyBalanceWithDecimals } = (await api.query.system.account(proxyAddress)) as unknown as {
						data: any;
					};
					const proxyBalance = {} as any;

					if (network === ENetwork.POLKADOT_ASSETHUB || network === ENetwork.ROCOCO_ASSETHUB) {
						const tokenData = await getTokenBalance(api, proxyAddress, network);
						tokenData.map((t) => {
							const currencies = currencyData?.[String(t.symbol).toLowerCase()] || {};
							proxyBalance[String(t.symbol).toLowerCase()] = { ...t, ...currencies };
						});
					}

					// eslint-disable-next-line no-restricted-syntax
					for (const [key, value] of Object.entries(JSON.parse(JSON.stringify(proxyBalanceWithDecimals.toHuman())))) {
						proxyBalance[key] = formatBalance(
							String(value),
							{
								numberAfterComma: 3,
								withThousandDelimitor: true
							},
							network
						);
					}
					const usdValue = Number(currencyData?.[network]?.usd || 0) * Number(proxyBalance.free);
					const allCurrency: any = {};
					Object.keys(currencyData).map((network) => {
						const allCurrencyValue: any = {};
						Object.keys(currencyData?.[network] || {}).map((currency) => {
							allCurrencyValue[currency] = Number(currencyData?.[network]?.[currency] || 0) * Number(proxyBalance.free);
						});
						allCurrency[network] = allCurrencyValue;
					});
					return {
						...proxyBalance,
						usd: Number(usdValue.toFixed(3)),
						allCurrency,
						proxyAddress,
						address,
						network,
						symbol: networkConstants[network].tokenSymbol
					};
				});
				const proxyAssets = (await Promise.all(proxyAssetsPromise)).filter((a) => Boolean(a));

				return [
					{
						...balance,
						usd: Number(usdValue.toFixed(3)),
						allCurrency,
						address,
						network,
						symbol: networkConstants[network].tokenSymbol,
						proxy: proxyAssets
					}
				];
			});

			const assets = (await Promise.all(assetsPromise)).flat().filter((a) => Boolean(a));
			// console.log('assets', assets);
			setAtom({ assets: assets, refetch: handleOrganisationAssets });
		};
		handleOrganisationAssets();
	}, [getApi, organisation]);

	return null;
}

export default InitializeAssets;
