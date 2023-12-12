// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { responseMessages } from '@next-common/constants/response_messages';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import { IAsset } from '@next-common/types';
import { tokenProperties } from '@next-common/constants/token_constants';
import fetchTokenUSDValue from './fetchTokentoUSDPrice';
import formatBnBalance from './formatBnBalance';

interface IResponse {
	error?: string | null;
	data: IAsset[];
}

export default async function getAssetsForAddress(address: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		data: [],
		error: ''
	};

	try {
		const res = await fetch(`https://${network}.api.subscan.io/api/scan/account/tokens`, {
			body: JSON.stringify({ address }),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data: response } = await res.json();

		const assets: IAsset[] = [];

		if (response.native) {
			await Promise.all(
				response.native.map(async (asset) => {
					const usdValue = await fetchTokenUSDValue(1, network);

					const newAsset: IAsset = {
						balance_token: formatBnBalance(
							asset.balance,
							{
								numberAfterComma: 3,
								withThousandDelimitor: false
							},
							network
						),
						balance_usd:
							usdValue && !Number.isNaN(Number(usdValue))
								? `${
										Number(usdValue) *
										Number(
											formatBnBalance(
												asset.balance,
												{
													numberAfterComma: 3,
													withThousandDelimitor: false
												},
												network
											)
										)
								  }`
								: '',
						logoURI: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.logoURI || '',
						name: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.name || '',
						symbol: asset.symbol
						// TODO: cache token usd value
					};

					assets.push(newAsset);
				})
			);
		}

		returnValue.data = assets;
	} catch (err) {
		console.log('Error in _getAssetsForAddress:', err);
		returnValue.error = String(err) || responseMessages.assets_fetch_error;
	}

	return returnValue;
}
