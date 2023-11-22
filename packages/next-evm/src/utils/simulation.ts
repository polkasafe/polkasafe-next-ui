// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-underscore-dangle */
/* eslint-disable sort-keys */

import { encodeMultiSendData } from '@safe-global/protocol-kit';
import { getMultiSendCallOnlyDeployment } from '@safe-global/safe-deployments';

export const _tryDeploymentVersions = (
	getDeployment: (filter?: any) => any | undefined,
	network: string,
	version: string
): any | undefined => {
	// Unsupported Safe version
	if (version === null) {
		// Assume latest version as fallback
		return getDeployment({
			version: '1.3.0',
			network
		});
	}

	// Supported Safe version
	return getDeployment({
		version,
		network
	});
};

export const getMultiSendCallOnlyContractDeployment = (chainId: string, safeVersion: string) => {
	return _tryDeploymentVersions(getMultiSendCallOnlyDeployment, chainId, safeVersion);
};

export const getReadOnlyMultiSendCallOnlyContract = (chainId: string, safeVersion: string, ethAdapter: any) => {
	return ethAdapter.getMultiSendCallOnlyContract({
		chainId: Number(chainId),
		safeVersion,
		singletonDeployment: getMultiSendCallOnlyContractDeployment(chainId, safeVersion)
	});
};

export const _getMultiSendCallOnlyPayload = async (
	params: any,
	ethAdapter: any
): Promise<Pick<any, 'to' | 'input'>> => {
	const data = encodeMultiSendData(params.transactions);
	const readOnlyMultiSendContract = await getReadOnlyMultiSendCallOnlyContract(
		String(params.chainId),
		'1.3.0',
		ethAdapter
	);

	return {
		input: readOnlyMultiSendContract.encode('multiSend', [data]),
		to: readOnlyMultiSendContract.getAddress()
	};
};

export const getSimulation = async (tx: any): Promise<any> => {
	const requestObject: RequestInit = {
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'content-type': 'application/JSON',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'X-Access-Key': process.env.NEXT_PUBLIC_POLKASAFE_TENDERLY_KEY
		},
		method: 'POST',
		body: JSON.stringify(tx)
	};

	const data = await fetch(
		'https://api.tenderly.co/api/v1/account/aadarsh012/project/polkasafe/simulate',
		requestObject
	).then(async (res) => {
		if (res.ok) {
			return res.json();
		}
		// eslint-disable-next-line @typescript-eslint/no-shadow
		return res.json().then((data) => {
			throw new Error(`${res.status} - ${res.statusText}: ${data?.error?.message}`);
		});
	});

	return data as any;
};

export const getSimulationLink = (simulationId: string): string => {
	return `https://dashboard.tenderly.co/public/aadarsh012/polkasafe/simulator/${simulationId}`;
};
