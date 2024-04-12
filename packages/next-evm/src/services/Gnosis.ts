// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import SafeApiKit, {
	AllTransactionsListResponse,
	OwnerResponse,
	SafeCreationInfoResponse,
	SafeInfoResponse,
	SafeMultisigTransactionListResponse,
	SignatureResponse
} from '@safe-global/api-kit';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk';
import {
	MetaTransactionData,
	// SafeTransactionDataPartial,
	TransactionResult
} from '@safe-global/safe-core-sdk-types';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
// eslint-disable-next-line import/no-cycle
import createTokenTransferParams from '@next-evm/utils/createTokenTransaferParams';
import { IAsset } from '@next-common/types';
import {
	_getMultiSendCallOnlyPayload,
	_getSingleTransactionPayload,
	_getStateOverride,
	getSimulation,
	getStateOverwrites
} from '@next-evm/utils/simulation';
import { Interface } from '@ethersproject/abi';
import createNftTransferParams from '@next-evm/utils/createNftTransferParams';
import streamABI from '../../stream-abi.json';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export default class GnosisSafeService {
	ethAdapter: any;

	safeFactory: any;

	signer: any;

	safeService: SafeApiKit;

	constructor(ethersProvider: any, signer: any, txServiceURL: any) {
		this.ethAdapter = ethersProvider;
		this.signer = signer;
		this.safeService = new SafeApiKit({
			ethAdapter: this.ethAdapter,
			txServiceUrl: txServiceURL
		});
	}

	// eslint-disable-next-line consistent-return
	createSafe = async (owners: [string], threshold: number, contractNetworks?: any): Promise<string | undefined> => {
		try {
			const safeAccountConfig: SafeAccountConfig = {
				owners,
				threshold
			};

			const safeFactory = await SafeFactory.create({
				contractNetworks,
				ethAdapter: this.ethAdapter
			});

			const safe = await safeFactory.deploySafe({
				options: {
					gasLimit: 1000000
				},
				safeAccountConfig
			});
			return await safe.getAddress();
		} catch (err) {
			console.log('error from createSafe', err);
		}
	};

	getAllSafesByOwner = async (ownerAddress: string): Promise<OwnerResponse | null> => {
		try {
			return await this.safeService.getSafesByOwner(ownerAddress);
		} catch (err) {
			console.log('error from getAllSafesByOwner', err);
			return null;
		}
	};

	getSafeInfoByAddress = async (safeAddress: string): Promise<SafeInfoResponse | null> => {
		try {
			return await this.safeService.getSafeInfo(safeAddress);
		} catch (err) {
			console.log('error from getSafeInfoByAddress', err);
			return null;
		}
	};

	confirmTxByHash = async (txHash: string, signature: any): Promise<SignatureResponse | null> => {
		try {
			return await this.safeService.confirmTransaction(txHash, signature);
		} catch (err) {
			console.log('error from confirmTxByHash', err);
			return null;
		}
	};

	createRejectTransactionByNonce = async (
		txNonce: number,
		multisigAddress: string,
		senderAddress: string,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const rejectionTransaction = await safeSdk.createRejectionTransaction(txNonce);
			const safeTxHash = await safeSdk.getTransactionHash(rejectionTransaction);
			let signature = (await safeSdk.signTransaction(rejectionTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				rejectionTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: rejectionTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log('error from createRejectTransactionByNonce', err);
			return null;
		}
	};

	getSafeCreationInfo = async (safeAddress: string): Promise<SafeCreationInfoResponse | null> => {
		try {
			return await this.safeService.getSafeCreationInfo(safeAddress);
		} catch (err) {
			console.log('error from getSafeCreationInfo', err);
			return null;
		}
	};

	createSafeTx = async (
		multisigAddress: string,
		to: string[],
		value: string[],
		senderAddress: string,
		note?: string,
		tokens?: IAsset[],
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			console.log('to, tokens', to, tokens);
			const signer = await this.ethAdapter.getSignerAddress();

			const safeTransactionData: MetaTransactionData | MetaTransactionData[] = createTokenTransferParams(
				to,
				value,
				tokens
			);

			console.log('safe data', safeTransactionData);

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	createNftTx = async (
		multisigAddress: string,
		to: string,
		senderAddress: string,
		tokenId: string,
		tokenAddress: string,
		note?: string,
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const safeTransactionData: MetaTransactionData = createNftTransferParams(
				multisigAddress,
				to,
				tokenId,
				tokenAddress
			);

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	createStreamTx = async (
		multisigAddress: string,
		to: string,
		value: string,
		senderAddress: string,
		superTokenAddress: string,
		note?: string,
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const abi = streamABI;

			const contractInterface = new Interface(abi);

			const data = contractInterface.encodeFunctionData('createFlow', [
				superTokenAddress,
				multisigAddress,
				to,
				value,
				'0x'
			]);

			const safeTransactionData: MetaTransactionData = {
				data,
				to: '0xcfA132E353cB4E398080B9700609bb008eceB125',
				value: '0'
			};

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	createUpdateStreamTx = async (
		multisigAddress: string,
		to: string,
		value: string,
		senderAddress: string,
		superTokenAddress: string,
		note?: string,
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const abi = streamABI;

			const contractInterface = new Interface(abi);

			const data = contractInterface.encodeFunctionData('updateFlow', [
				superTokenAddress,
				multisigAddress,
				to,
				value,
				'0x'
			]);

			const safeTransactionData: MetaTransactionData = {
				data,
				to: '0xcfA132E353cB4E398080B9700609bb008eceB125',
				value: '0'
			};

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	createDeleteStreamTx = async (
		multisigAddress: string,
		to: string,
		senderAddress: string,
		superTokenAddress: string,
		note?: string,
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const abi = streamABI;

			const contractInterface = new Interface(abi);

			const data = contractInterface.encodeFunctionData('deleteFlow', [superTokenAddress, multisigAddress, to, '0x']);

			const safeTransactionData: MetaTransactionData = {
				data,
				to: '0xcfA132E353cB4E398080B9700609bb008eceB125',
				value: '0'
			};

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	createTxnBuilderTx = async (
		multisigAddress: string,
		to: string,
		senderAddress: string,
		data: string,
		note?: string,
		nonce?: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const safeTransactionData: MetaTransactionData = {
				data,
				to,
				value: '0'
			};

			if (note) console.log(note);

			const safeTransaction = await safeSdk.createTransaction({
				options: { nonce },
				safeTransactionData
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});

			return safeTxHash;
		} catch (err) {
			console.log(err);
			// console.log('error from createSafeTx', err);
			return null;
		}
	};

	getTxSimulationData = async (
		multisigAddress: string,
		to: string[],
		value: string[],
		senderAddress: string,
		tokens?: IAsset[],
		chainId?: number
	): Promise<any | null> => {
		try {
			const safeSdk = await Safe.create({
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const safeTransactionData: MetaTransactionData | MetaTransactionData[] = createTokenTransferParams(
				to,
				value,
				tokens
			);
			const safeTransaction = await safeSdk.createTransaction({
				onlyCalls: Array.isArray(safeTransactionData),
				safeTransactionData
			});

			const safe = await this.getSafeInfoByAddress(multisigAddress);
			const payload = await this.getSimulationPayload({
				chainId,
				executionOwner: senderAddress,
				gasLimit: 8000000,
				safe,
				safeAddress: multisigAddress,
				transactions: safeTransaction
			});
			const data = await getSimulation(payload);

			console.log('simulate data', data);
			return data;
		} catch (error) {
			console.log('error in simulate transaction', error);
			return null;
		}
	};

	// createGelatoTx = async (
	// multisigAddress: string,
	// to: string[],
	// value: string[],
	// senderAddress: string,
	// note?: string,
	// tokens?: IAsset[]
	// ): Promise<string | null> => {
	// try {
	// const safeSdk = await Safe.create({
	// ethAdapter: this.ethAdapter,
	// safeAddress: multisigAddress
	// });

	// const relayKit = new GelatoRelayPack();
	// const signer = await this.ethAdapter.getSignerAddress();

	// const safeTransactionData: MetaTransactionData[] = createTokenTransferParams(to, value, tokens);
	// const safeTransaction = await relayKit.createRelayedTransaction({
	// safe: safeSdk as any,
	// transactions: safeTransactionData
	// });
	// console.log('after relay Transactino', safeTransaction);

	// const signature = await safeSdk.signTransaction(safeTransaction as any);

	// console.log('afer signature', signature);

	// const response = await relayKit.executeRelayTransaction(signature as any, safeSdk as any);
	// console.log('respone', response);

	// console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`);

	// if (note) console.log(note);

	// // const safeTransaction = await safeSdk.createTransaction({
	// // safeTransactionData
	// // });
	// const safeTxHash = await safeSdk.getTransactionHash(safeTransaction as any);
	// // let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

	// // signature = Object.fromEntries(signature.signatures.entries());
	// console.log(
	// multisigAddress,
	// safeTransaction.data,
	// safeTxHash,
	// senderAddress,
	// Object.fromEntries(signature.signatures.entries())[signer.toLowerCase()].data
	// );
	// await this.safeService.proposeTransaction({
	// safeAddress: multisigAddress,
	// safeTransactionData: safeTransaction.data as any,
	// safeTxHash,
	// senderAddress,
	// senderSignature: Object.fromEntries(signature.signatures.entries())[signer.toLowerCase()].data
	// });

	// return safeTxHash;
	// } catch (err) {
	// console.log(err);
	// // console.log('error from createSafeTx', err);
	// return null;
	// }
	// };

	createAddOwner = async (
		multisigAddress: string,
		senderAddress: string,
		ownerAddress: string,
		threshold: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();
			const safeTransaction = await safeSdk.createAddOwnerTx({
				ownerAddress,
				threshold
			});
			console.log(safeTransaction);
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;
			console.log(signature);
			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});
			return safeTxHash;
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	createRemoveOwner = async (
		multisigAddress: string,
		senderAddress: string,
		ownerAddress: string,
		threshold: number,
		contractNetworks?: any
	): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisigAddress
			});
			const signer = await this.ethAdapter.getSignerAddress();

			const safeTransaction = await safeSdk.createRemoveOwnerTx({
				ownerAddress,
				threshold
			});
			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

			signature = Object.fromEntries(signature.signatures.entries());
			console.log(
				multisigAddress,
				safeTransaction.data,
				safeTxHash,
				senderAddress,
				signature[signer.toLowerCase()].data
			);
			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data as any,
				safeTxHash,
				senderAddress,
				senderSignature: signature[signer.toLowerCase()].data
			});
			return safeTxHash;
		} catch (err) {
			console.log(err);
			return null;
		}
	};

	getPendingTx = async (multisigAddress: string): Promise<SafeMultisigTransactionListResponse> => {
		return this.safeService.getPendingTransactions(multisigAddress);
	};

	getMultisigTxns = async (multisigAddress: string): Promise<SafeMultisigTransactionListResponse> => {
		return this.safeService.getMultisigTransactions(multisigAddress);
	};

	// eslint-disable-next-line class-methods-use-this
	getMultisigAllAssets = async (network: NETWORK, multisigAddress: string): Promise<any> => {
		const assets: SafeBalanceResponse = await getBalances(
			chainProperties[network].chainId.toString(),
			multisigAddress,
			undefined,
			{
				exclude_spam: true,
				trusted: true
			}
		);
		// eslint-disable-next-line @typescript-eslint/return-await
		return assets;
	};

	getAllTx = async (multisigAddress: string, options: any = {}): Promise<AllTransactionsListResponse> => {
		return this.safeService.getAllTransactions(multisigAddress, options);
	};

	signAndConfirmTx = async (
		txHash: string,
		multisig: string,
		contractNetworks?: any
	): Promise<SignatureResponse | null> => {
		try {
			const signer = await this.ethAdapter.getSignerAddress();
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisig
			});
			const safeTransaction = await this.safeService.getTransaction(txHash);
			let signature = (await safeSdk.signTransaction(safeTransaction as any)) as any;
			signature = Object.fromEntries(signature.signatures.entries());
			return await this.safeService.confirmTransaction(txHash, signature[signer.toLowerCase()].data);
		} catch (err) {
			console.log('error from signAndConfirmTx', err);
			return null;
		}
	};

	executeTx = async (
		txHash: string,
		multisig: string,
		contractNetworks?: any
	): Promise<{ data: TransactionResult | null; error: string | null }> => {
		try {
			const safeSdk = await Safe.create({
				contractNetworks,
				ethAdapter: this.ethAdapter,
				isL1SafeMasterCopy: true,
				safeAddress: multisig
			});
			const safeTransaction = await this.safeService.getTransaction(txHash);
			const executeTxResponse = await safeSdk.executeTransaction(safeTransaction as any);
			return { data: executeTxResponse as any, error: null };
		} catch (err) {
			console.log('error from executeTx', err);
			return { data: null, error: err.message || 'Something went wrong' };
		}
	};

	getMultisigData = async (multisigAddress: string): Promise<SafeInfoResponse | null> => {
		try {
			return await this.safeService.getSafeInfo(multisigAddress);
		} catch (err) {
			console.log('error from getMultisigData', err);
			return null;
		}
	};

	getAllSafeByOwner = async (owner: string): Promise<OwnerResponse | null> => {
		try {
			return await this.safeService.getSafesByOwner(owner);
		} catch (err) {
			console.log('error from getMultisigData', err);
			return null;
		}
	};

	getSimulationPayload = async (params: any): Promise<any> => {
		const { gasLimit } = params;

		const payload = !Array.isArray(params.transaction)
			? await _getSingleTransactionPayload(params, this.ethAdapter)
			: await _getMultiSendCallOnlyPayload(params, this.ethAdapter);

		const stateOverwrites = getStateOverwrites(params);
		const stateOverwritesLength = Object.keys(stateOverwrites).length;
		return {
			...payload,
			from: params.executionOwner,
			gas: gasLimit,
			// With gas price 0 account don't need token for gas
			gas_price: '0',
			network_id: params.chainId || 137,
			save: true,
			save_if_fails: true,
			state_objects:
				stateOverwritesLength > 0
					? _getStateOverride(params.safeAddress, undefined, undefined, stateOverwrites)
					: undefined
		};
	};
}
