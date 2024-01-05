// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Interface } from '@ethersproject/abi';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';

const encodeERC721TransferData = (from: string, to: string, tokenId: string): string => {
	const erc721Abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
	const contractInterface = new Interface(erc721Abi);
	return contractInterface.encodeFunctionData('safeTransferFrom', [from, to, tokenId]);
};

const createNftTransferParams = (
	from: string,
	to: string,
	tokenId: string,
	tokenAddress: string
): MetaTransactionData => {
	const data = encodeERC721TransferData(from, to, tokenId);

	return {
		data,
		to: tokenAddress,
		value: '0'
	};
};

export default createNftTransferParams;
