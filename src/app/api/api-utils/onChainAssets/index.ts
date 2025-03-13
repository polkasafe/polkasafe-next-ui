// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDBAssets, IResponse } from '@common/types/substrate';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import { tokenProperties } from '@common/constants/tokenProperties';
import axios from 'axios';
import { ResponseMessages } from '@common/constants/responseMessage';
import { ECurrency, ENetwork } from '@common/enum/substrate';
import { tokenValue } from '@substrate/app/api/api-utils/tokenValue';
import BN from 'bn.js';

export const onChainAssets = async (address: string, network: ENetwork): Promise<IResponse<Array<IDBAssets>>> => {
	const returnValue: IResponse<Array<IDBAssets>> = {
		data: [],
		error: ''
	};
	if (!address && !network) {
		return returnValue;
	}

	try {
		const res = await axios.post(
			`https://${network}.api.subscan.io/api/scan/account/tokens`,
			{ address },
			{ headers: SUBSCAN_API_HEADERS }
		);

		const { data: response } = res.data;

		if (response.native) {
			returnValue.data = await Promise.all(
				response.native.map(async (asset: any) => {
					const usdValue = await tokenValue(network, ECurrency.USD);
					const tokenUSDBalance = new BN(usdValue)
						.mul(
							new BN(
								formatBalance(
									asset.balance,
									{
										numberAfterComma: 2,
										withThousandDelimitor: false
									},
									network
								)
									.split('.')
									.join('')
							)
						)
						.toString();

					return {
						balance_token: formatBalance(
							asset.balance,
							{
								numberAfterComma: 3,
								withThousandDelimitor: false
							},
							network
						),
						balance_usd: tokenUSDBalance,
						logoURI: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.logoURI || '',
						name: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.name || '',
						symbol: asset.symbol
					};
				})
			);
		}
		return returnValue;
	} catch (err) {
		console.log('Error in onChainAssets:', err);
		returnValue.error = String(err) || ResponseMessages.ASSETS_FETCH_ERROR;
		return returnValue;
	}
};
