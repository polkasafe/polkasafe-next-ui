// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from '@next-common/global/evm-network-constants';
import returnTxUrl from '@next-common/global/gnosisService';
import SafeApiKit from '@safe-global/api-kit';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { Signer, ethers } from 'ethers';

export default async function getSafeInfoByNetwork(safeAddress: string, network: NETWORK, signer: Signer) {
	const txUrl = returnTxUrl(network);
	const web3Adapter = new EthersAdapter({
		ethers,
		signerOrProvider: signer
	});

	const safeService = new SafeApiKit({
		ethAdapter: web3Adapter as any,
		txServiceUrl: txUrl
	});
	return safeService.getSafeInfo(safeAddress);
}
