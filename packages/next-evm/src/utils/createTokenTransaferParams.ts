// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Interface } from '@ethersproject/abi';
// eslint-disable-next-line import/no-cycle
import { EAssetType, IAsset } from '@next-common/types';
// import { pack as solidityPack } from '@ethersproject/solidity';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { OperationType } from '@safe-global/safe-core-sdk-types/dist/src/types';

// of the Apache-2.0 license. See the LICENSE file for details.
const encodeERC20TransferData = (to: string, value: any): string => {
	const erc20Abi = ['function transfer(address to, uint256 value)'];
	const contractInterface = new Interface(erc20Abi);
	return contractInterface.encodeFunctionData('transfer', [to, value]);
};

const createTokenTransferParams = (
	recipient: string[],
	value: string[],
	tokens?: IAsset[]
): MetaTransactionData | MetaTransactionData[] => {
	if (recipient.length > 1) {
		return recipient.map((r, i) => {
			if (tokens && tokens.length !== 0 && tokens?.[i]?.tokenAddress) {
				return {
					data: encodeERC20TransferData(r, value[i] as any),
					operation: OperationType.Call,
					to: tokens[i].tokenAddress,
					value: '0'
				};
			}
			return {
				data: '0x',
				operation: OperationType.Call,
				to: r,
				value: value[i]
			};
		}) as MetaTransactionData[];
	}
	if (tokens && tokens.length !== 0 && tokens?.[0]?.tokenAddress && tokens?.[0]?.type !== EAssetType.NATIVE_TOKEN) {
		return {
			data: encodeERC20TransferData(recipient[0], value[0] as any),
			to: tokens[0].tokenAddress,
			value: '0'
		} as MetaTransactionData;
	}
	return {
		data: '0x',
		to: recipient[0],
		value: value[0]
	} as MetaTransactionData;
};

export default createTokenTransferParams;
