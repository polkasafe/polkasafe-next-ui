// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-underscore-dangle */
/* eslint-disable sort-keys */

import { encodeMultiSendData } from '@safe-global/protocol-kit';
import { getMultiSendCallOnlyDeployment } from '@safe-global/safe-deployments';
import { generatePreValidatedSignature } from '@safe-global/safe-core-sdk/dist/src/utils/signatures';
import EthSafeTransaction from '@safe-global/safe-core-sdk/dist/src/utils/transactions/SafeTransaction';
import { ethers } from 'ethers';

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
		'https://api.tenderly.co/api/v1/account/aadarsh012/project/polka/simulate',
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

export const setSimulationSharing = async (simulationId: string): Promise<any> => {
	const requestObject: RequestInit = {
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'content-type': 'application/JSON',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'X-Access-Key': process.env.NEXT_PUBLIC_POLKASAFE_TENDERLY_KEY
		},
		method: 'POST'
	};

	const data = await fetch(
		`https://api.tenderly.co/api/v1/account/aadarsh012/project/polka/simulations/${simulationId}/share`,
		requestObject
	)
		.then(async (res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		});

	return data as any;
};

export const getSimulationLink = (simulationId: string): string => {
	// return `https://dashboard.tenderly.co/aadarsh012/polka/simulator/${simulationId}`;
	return `https://www.tdly.co/shared/simulation/${simulationId}`;
};

const getGnosisSafeContractEthers = (safeAddress: string, chainId: number, version: string, ethAdapter: any): any => {
	return ethAdapter.getSafeContract({
		customContractAddress: safeAddress,
		chainId: +chainId,
		safeVersion: version
	});
};

export const getReadOnlyCurrentGnosisSafeContract = (
	safeAddress: string,
	chainId: number,
	version: string,
	ethAdapter: any
): any => {
	return getGnosisSafeContractEthers(safeAddress, chainId, version, ethAdapter);
};

export const _getSingleTransactionPayload = async (
	params: any,
	ethAdapter: any
): Promise<Pick<any, 'to' | 'input'>> => {
	// If a transaction is executable we simulate with the proposed/selected gasLimit and the actual signatures
	let transaction = params.transactions;
	const hasOwnerSignature = transaction.signatures.has(params.executionOwner);
	// If the owner's sig is missing and the tx threshold is not reached we add the owner's preValidated signature
	const needsOwnerSignature = !hasOwnerSignature && transaction.signatures.size < params.safe.threshold;
	if (needsOwnerSignature) {
		const simulatedTransaction = new EthSafeTransaction(transaction.data);

		transaction.signatures.forEach((signature: any) => {
			simulatedTransaction.addSignature(signature);
		});
		simulatedTransaction.addSignature(generatePreValidatedSignature(params.executionOwner));

		transaction = simulatedTransaction;
	}

	const readOnlySafeContract = await getReadOnlyCurrentGnosisSafeContract(
		params.safeAddress,
		params.chainId,
		'1.3.0',
		ethAdapter
	);

	const input = readOnlySafeContract.encode('execTransaction', [
		transaction.data.to,
		transaction.data.value,
		transaction.data.data,
		transaction.data.operation,
		transaction.data.safeTxGas,
		transaction.data.baseGas,
		transaction.data.gasPrice,
		transaction.data.gasToken,
		transaction.data.refundReceiver,
		transaction.encodedSignatures()
	]);

	return {
		to: readOnlySafeContract.getAddress(),
		input
	};
};

export const _getStateOverride = (
	address: string,
	balance?: string,
	code?: string,
	storage?: Record<string, string>
): Record<string, any> => {
	return {
		[address]: {
			balance,
			code,
			storage
		}
	};
};

const isOverwriteThreshold = (params: any) => {
	if (Array.isArray(params.transaction)) {
		return false;
	}
	const tx = params.transactions;
	const hasOwnerSig = tx.signatures.has(params.executionOwner);
	const effectiveSigs = tx.signatures.size + (hasOwnerSig ? 0 : 1);
	return params.safe.threshold > effectiveSigs;
};

// eslint-disable-next-line consistent-return
const getNonceOverwrite = (params: any): number | undefined => {
	if (Array.isArray(params.transaction)) {
		return undefined;
	}
	const txNonce = params.transactions.data.nonce;
	const safeNonce = params.safe.nonce;
	if (txNonce > safeNonce) {
		return txNonce;
	}
};

/* We need to overwrite the threshold stored in smart contract storage to 1
	to do a proper simulation that takes transaction guards into account.
	The threshold is stored in storage slot 4 and uses full 32 bytes slot.
	Safe storage layout can be found here:
	https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/GnosisSafeStorage.sol */
export const THRESHOLD_STORAGE_POSITION = ethers.utils.hexZeroPad('0x4', 32);
export const THRESHOLD_OVERWRITE = ethers.utils.hexZeroPad('0x1', 32);
/* We need to overwrite the nonce if we simulate a (partially) signed transaction which is not at the top position of the tx queue.
	The nonce can be found in storage slot 5 and uses a full 32 bytes slot. */
export const NONCE_STORAGE_POSITION = ethers.utils.hexZeroPad('0x5', 32);

export const getStateOverwrites = (params: any) => {
	const nonceOverwrite = getNonceOverwrite(params);
	const isThresholdOverwrite = isOverwriteThreshold(params);

	const storageOverwrites: Record<string, string> = {} as Record<string, string>;

	if (isThresholdOverwrite) {
		storageOverwrites[THRESHOLD_STORAGE_POSITION] = THRESHOLD_OVERWRITE;
	}
	if (nonceOverwrite) {
		storageOverwrites[NONCE_STORAGE_POSITION] = ethers.utils.hexZeroPad(
			ethers.BigNumber.from(nonceOverwrite).toHexString(),
			32
		);
	}

	return storageOverwrites;
};
