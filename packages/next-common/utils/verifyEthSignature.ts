// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ethers } from 'ethers';

const verifyEthSignature = async (address: string, signature: string, message: string): Promise<boolean> => {
	const recoveredAddress = ethers.verifyMessage(message, signature);
	return recoveredAddress.toLowerCase() === address.toLowerCase();
};

export default verifyEthSignature;
