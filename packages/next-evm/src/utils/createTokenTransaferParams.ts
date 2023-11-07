// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Interface } from '@ethersproject/abi';
// eslint-disable-next-line import/no-cycle
import { IAsset } from '@next-common/types';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';

// of the Apache-2.0 license. See the LICENSE file for details.
const encodeERC20TransferData = (to: string, value: string): string => {
	const erc20Abi = ['function transfer(address to, uint256 value)'];
	const contractInterface = new Interface(erc20Abi);
	return contractInterface.encodeFunctionData('transfer', [to, value]);
};

const createTokenTransferParams = (recipient: string[], value: string[], tokens?: IAsset[]): MetaTransactionData[] => {
	return recipient.map((r, i) => {
		if (tokens && tokens.length !== 0 && tokens?.[i]?.tokenAddress) {
			return {
				data: encodeERC20TransferData(r, value[i]),
				to: tokens[i].tokenAddress,
				value: '0'
			};
		}
		return {
			data: encodeERC20TransferData(r, value[i]),
			to: r,
			value: value[i]
		};
	});
};

export default createTokenTransferParams;
