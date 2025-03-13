// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_MULTISIG_NAME } from '@common/constants/defaults';
import { ResponseMessages } from '@common/constants/responseMessage';
import { IResponse } from '@common/types/substrate';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { SUBSCAN_API_HEADERS } from '@substrate/app/api/constants/subscane';
import axios from 'axios';

interface IOnchainMultisigResponse {
	name: string;
	signatories: string[];
	threshold: number;
	balance: string;
	proxy?: Array<{ address: string; name: string }>;
}

export const onChainMultisig = async (
	multisigAddress: string,
	network: string
): Promise<IResponse<IOnchainMultisigResponse>> => {
	const returnValue: IResponse<IOnchainMultisigResponse> = {
		data: {
			balance: '0',
			name: DEFAULT_MULTISIG_NAME,
			signatories: [],
			threshold: 0
		},
		error: ''
	};

	try {
		const res = await axios.post(
			`https://${network}.api.subscan.io/api/v2/scan/search`,
			{
				key: multisigAddress,
				row: 1
			},
			{ headers: SUBSCAN_API_HEADERS }
		);

		const response = res.data;
		console.log('response:', response?.data?.account?.multisig?.multi_account_member);

		const proxy = (response?.data?.account?.proxy?.real_account || []).map((multiData: any) => ({
			address: multiData.account_display.address,
			name: ''
		}));
		returnValue.data = {
			balance: response?.data?.account?.balance || '0',
			name: response?.data?.account?.account_display.display || DEFAULT_MULTISIG_NAME,
			signatories:
				response?.data?.account?.multisig?.multi_account_member?.map((obj: any) => getSubstrateAddress(obj.address)) ||
				[],
			threshold: response?.data?.account?.multisig?.threshold || null,
			proxy
		};
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || ResponseMessages.ONCHAIN_MULTISIG_FETCH_ERROR;
	}

	return returnValue;
};
