// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { responseMessages } from '@next-common/constants/response_messages';
import { networks } from '@next-common/global/networkConstants';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import isValidSignature from './isValidSignature';

const whitelist = [
	getSubstrateAddress('16Ge612BDMd2GHKWFPhkmJizF7zgYEmtD1xPpnLwFT2WxS1'),
	getSubstrateAddress('1tCjdvnVKEoEKwPnHjiWverQPZw7fwrHJ9beizBYWC3nTwm'),
	getSubstrateAddress('15s78GDxmAhxNdt6pxaxGcPrzboaMem5k3jP3xXyZvVVfLLr'),
	getSubstrateAddress('15kAhLvVhtQuWyMDvts3pPAbz3maLbz7CSdwcbg5UQ96GATt'),
	getSubstrateAddress('15Sf9AnqDooBgdV91hixPHY99SJom9DMzLKbxg6dYRsqTa4a'),
	getSubstrateAddress('5Gq84otocj45uGWqB4cacNnVeyCCFeKHg6EtK76BLvh2sM1s')
];

export default async function isValidRequest(
	address?: string,
	signature?: string,
	network?: string
): Promise<{ isValid: boolean; error: string }> {
	if (whitelist.includes(getSubstrateAddress(address))) {
		return { error: '', isValid: true };
	}
	if (!address || !signature || !network) return { error: responseMessages.missing_headers, isValid: false };
	if (!getSubstrateAddress(address)) return { error: responseMessages.invalid_headers, isValid: false };
	if (!Object.values(networks).includes(network)) return { error: responseMessages.invalid_network, isValid: false };

	const isValid = await isValidSignature(signature, address);
	if (!isValid) return { error: responseMessages.invalid_signature, isValid: false };
	return { error: '', isValid: true };
}
