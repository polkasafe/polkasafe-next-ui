// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import { responseMessages } from '@next-common/constants/response_messages';
import { SUBSCAN_API_HEADERS } from '@next-common/global/subscan_consts';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';

interface IResponse {
	error?: string | null;
	data: {
		name: string;
		signatories: string[];
		threshold: number;
		balance: string;
	};
}

export default async function getOnChainMultisigMetaData(multisigAddress: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		data: {
			balance: '0',
			name: DEFAULT_MULTISIG_NAME,
			signatories: [],
			threshold: 0
		},
		error: ''
	};

	try {
		const res = await fetch(`https://${network}.api.subscan.io/api/v2/scan/search`, {
			body: JSON.stringify({
				key: multisigAddress,
				row: 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const { data: response } = await res.json();

		returnValue.data = {
			balance: response?.data?.account?.balance || '0',
			name: response?.data?.account?.account_display.display || DEFAULT_MULTISIG_NAME,
			signatories:
				response?.data?.account?.multisig?.multi_account_member?.map((obj: any) => getSubstrateAddress(obj.address)) ||
				[],
			threshold: response?.data?.account?.multisig?.threshold || null
		};
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || responseMessages.onchain_multisig_fetch_error;
	}

	return returnValue;
}
