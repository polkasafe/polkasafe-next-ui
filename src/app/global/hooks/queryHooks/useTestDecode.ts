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
	callHash: string;
	callData: string;
}

export function useTestDecode({ apiData, blockNumber, extrinsicIndex, callHash, callData }: IUseHistoryTransaction) {
	const decodedData = async () => {
		const payload = {} as IGenericObject;

		const { api } = apiData as { api: ApiPromise };

		// get block from api

		const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
		console.log('blockHash', blockHash);
		const block = await api.rpc.chain.getBlock(blockHash);

		const extrinsic = block.block.extrinsics[extrinsicIndex];

		extrinsic.method.args.map((arg: any, index: number) => {
			if (index === 3) {
				console.log('arg', arg.toHex());
			}
			console.log('__Index', index);
		});
		console.log('extrinsicCall');

		if (!callData && extrinsic.method.section === 'multisig' && extrinsic.method.method === 'asMulti') {
			console.log('Found multisig call:', extrinsic.toHuman());

			// Extract the arguments for the nested call (which are typically in the first argument)
			const nestedCall = extrinsic.method.args[3]; // Assuming the first argument is the nested call
			console.log('Nested Call:', nestedCall.toHuman());

			// Get the hex representation of the nested call
			callData = nestedCall.toHex();
			console.log('Nested Call Data (Hex):', callData);
		}

		if (!apiData || !apiData.api || !callData) {
			return payload;
		}

		const call = api.createType('Call', callData);
		console.log('call', call);
		const callJSONData = call.toHuman();
		const metaData = call.meta.toHuman();
		const allCalls: any = [];
		function decodeCallData(call: IGenericObject, payload: IGenericObject = {}) {
			if (!call) {
				return;
			}
			payload.method = call.method;
			payload.section = call.section;

			const currentPoint = call?.args as IGenericObject;
			// check is there a proxy address
			const proxyAddress = currentPoint?.real?.Id;
			if (proxyAddress) {
				payload.proxyAddress = proxyAddress;
			}

			// check if there is a dest address
			const destAddress = currentPoint?.dest?.Id;
			if (destAddress) {
				payload.to = destAddress;
			}

			const delegate = currentPoint?.delegate?.Id;
			if (delegate) {
				payload.delegate = delegate;
			}
			// check if there is a value
			const value = currentPoint?.value;
			if (value) {
				payload.value = value.split(',').join('');
			}

			const target = currentPoint?.target?.Id;
			const amount = currentPoint?.amount;
			const assetId = currentPoint?.id;
			if (target && amount && assetId) {
				payload.transfer = {
					target,
					amount,
					assetId
				};
			}

			const assets = currentPoint?.assets as IGenericObject;
			const beneficiary = currentPoint?.beneficiary as IGenericObject;
			const dest = currentPoint?.dest as IGenericObject;
			if (assets && beneficiary && dest) {
				payload.xcm = {
					assets: assets,
					beneficiary: beneficiary,
					dest
				};
			}

			allCalls.push(payload);
			// check is there any call or calls
			const callOrCalls = currentPoint?.call || currentPoint?.calls;

			// if callOrCalls is an object
			if (!Array.isArray(callOrCalls)) {
				const call = callOrCalls as IGenericObject;
				decodeCallData(call);
			}
			// if callOrCalls is an array
			if (Array.isArray(callOrCalls)) {
				for (const call of callOrCalls) {
					decodeCallData(call);
				}
			}
		}

		decodeCallData(callJSONData);
		return allCalls;
	};

	return useQuery({
		queryKey: [`decodeCallData_${callHash}_${blockNumber}_${extrinsicIndex}`],
		queryFn: decodedData
	});
}
