// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-restricted-syntax */
import { IGenericObject } from '@common/types/substrate';
import { ApiPromise } from '@polkadot/api';
import { IApiAtom } from '@substrate/app/atoms/api/apiAtom';
import { useQuery } from '@tanstack/react-query';

interface IUseHistoryTransaction {
	apiData: IApiAtom | null;
	blockNumber: number;
	extrinsicIndex: number;
}

export function useGetMultisigCallDataAndSigner({ apiData, blockNumber, extrinsicIndex }: IUseHistoryTransaction) {
	const decodedData = async () => {
		const { api } = apiData as { api: ApiPromise };
		const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
		const block = await api.rpc.chain.getBlock(blockHash);
		const extrinsic = block.block.extrinsics[extrinsicIndex];
		const signer = extrinsic.signer.toHuman();
		console.log('signer', signer);
		let callData;

		if (extrinsic.method.section === 'multisig' && extrinsic.method.method === 'asMulti') {
			console.log('Found multisig call:', extrinsic.toHuman());

			// Extract the arguments for the nested call (which are typically in the first argument)
			const nestedCall = extrinsic.method.args[3]; // Assuming the first argument is the nested call
			console.log('Nested Call:', nestedCall.toHuman());

			// Get the hex representation of the nested call
			callData = nestedCall.toHex();
			return `${callData}-${signer}`;
		}
		return `${callData}-${signer}`;
	};

	return useQuery({
		queryKey: [`multisig_call_data_${blockNumber}_${extrinsicIndex}`],
		queryFn: decodedData
	});
}
