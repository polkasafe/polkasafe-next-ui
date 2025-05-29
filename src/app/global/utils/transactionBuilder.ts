import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { EProposalType, ENetwork, ETransactionCreationType, ETxType, PostOrigin } from '@common/enum/substrate';
import {
	IApproveTransaction,
	ICallDataMultisigTransaction,
	ICancelTransaction,
	ICreateProxyTransaction,
	IDashboardTransaction,
	IDelegateMultisigTransaction,
	IEditMultisigTransaction,
	IFundTransaction,
	IGenericObject,
	IMultisig,
	IRecipient,
	ISetIdentityMultisigTransaction,
	ITeleportTransaction,
	ITransferTransaction
} from '@common/types/substrate';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { BN, BN_HUNDRED, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress, encodeMultiAddress, sortAddresses } from '@polkadot/util-crypto';
import { ERROR_MESSAGES } from '@substrate/app/global/genericErrors';
import { calcWeight } from '@substrate/app/global/utils/calculateWeight';
import createPreImage from '@substrate/app/global/utils/createPreimage';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import getIdentityRegistrarIndex from '@substrate/app/global/utils/getIdentityRegistrarIndex';
import getMultisigInfo from '@substrate/app/global/utils/getMultisigInfo';

const createRawObject = (value: string | undefined) => {
	return value
		? {
				Raw: value
			}
		: { none: null };
};

const getTransferCalls = (api: ApiPromise, data: IRecipient, network: ENetwork) => {
	const nativeToken = networkConstants[network].tokenSymbol;
	if (data.currency == nativeToken) {
		return api.tx.balances.transferKeepAlive(data.address, data.amount);
	}
	const token = networkConstants[network].supportedTokens.find((token: any) => token.symbol === data.currency);
	if (token) {
		console.log('--------------Asset Data', data.currency, data.address, data.amount.toString());
		return api.tx.assetsExt.transfer(token.id, data.address, data.amount, true);
	}
	return null;
};

const fund = async ({ api, data, multisig, sender: substrateSender, onSuccess, onFailed }: IFundTransaction) => {
	const { address, network } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	const tx = data
		.map((d) => {
			if (!d?.amount || !d?.recipient) {
				throw new Error('Amount and recipient are required');
			}
			const { amount, recipient } = d;
			const accountId = u8aToHex(decodeAddress(recipient));
			return api.tx.balances.transferKeepAlive(accountId, amount);
		})
		.filter((tx) => tx !== null);

	if (!tx || tx.length === 0) {
		return;
	}

	const transaction = tx.length > 1 ? api.tx.utility.batchAll(tx) : tx[0];

	const afterSuccess = () => {
		const newTransaction = {
			callData: transaction.method.toHex(),
			callHash: transaction.method.hash.toString(),
			network,
			amountToken: formatBalance(
				data?.[0]?.amount.toString() || '0',
				{
					numberAfterComma: 3,
					withThousandDelimitor: false
				},
				network
			),
			to: data?.[0]?.recipient || '',
			createdAt: new Date(),
			multisigAddress: address,
			from: address
		} as IDashboardTransaction;
		console.log(tx, 'transaction hash');
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: transaction as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const transfer = async ({
	api,
	data,
	multisig,
	proxyAddress,
	isProxy,
	params = {},
	sender: substrateSender,
	onSuccess,
	onFailed
}: ITransferTransaction) => {
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = substrateSender;
	console.log('allSignatories', allSignatories);

	// Sort signatories
	const signatories = allSignatories.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));
	console.log('signatories', signatories);
	const tx = data
		.map((d) => {
			if (!d?.amount || !d?.recipient) {
				throw new Error('Amount and recipient are required');
			}
			const { amount, recipient, currency } = d;
			const accountId = u8aToHex(decodeAddress(recipient));
			console.log('accountId', accountId);
			console.log('currency', currency);
			console.log('network', network);
			console.log('amount', amount);
			return getTransferCalls(api, { amount, address: accountId, currency: d.currency }, network);
		})
		.filter((tx) => tx !== null);

	console.log('tx', tx);

	if (!tx || tx.length === 0) {
		return;
		// throw new Error(ERROR_MESSAGES.INVALID_TRANSACTION);
	}

	const getTransaction = (tx: SubmittableExtrinsic<'promise'>) => {
		if (isProxy) {
			return api.tx.proxy.proxy(proxyAddress, null, tx);
		}
		return tx;
	};

	const batchOrSingleTx = tx.length > 1 ? api.tx.utility.batchAll(tx) : tx[0];
	if (!batchOrSingleTx) {
		return;
	}
	const MAX_WEIGHT = (await batchOrSingleTx?.paymentInfo(address))?.weight;
	const transaction = getTransaction(batchOrSingleTx);
	const signableTransaction = api.tx.multisig.asMulti(threshold, signatories, null, transaction, MAX_WEIGHT);

	const afterSuccess = () => {
		const newTransaction = {
			callData: transaction.method.toHex(),
			callHash: transaction.method.hash.toString(),
			network,
			amountToken: formatBalance(
				data?.[0]?.amount.toString() || '0',
				{
					numberAfterComma: 3,
					withThousandDelimitor: false
				},
				network
			),
			to: data?.[0]?.recipient || '',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender],
			initiator: sender
		} as IDashboardTransaction;
		console.log(tx, 'transaction hash');
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: signableTransaction as SubmittableExtrinsic<'promise'>,
		address: sender,
		params,
		onSuccess: afterSuccess,
		onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const teleportAssets = async ({
	api,
	recipientAddress,
	recipientNetwork,
	amount,
	multisig,
	proxyAddress,
	isProxy,
	params = {},
	sender: substrateSender,
	onSuccess,
	onFailed
}: ITeleportTransaction) => {
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	const signatories = allSignatories
		.map((s) => getEncodedAddress(s, network) || s)
		.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));

	const accountId = u8aToHex(decodeAddress(recipientAddress));

	const assets = [
		{
			id: {
				Concrete: {
					parents: '0',
					interior: 'Here'
				}
			},
			fun: {
				Fungible: amount.toString()
			}
		}
	];

	const tx = api.tx.polkadotXcm.limitedTeleportAssets(
		{
			V3: {
				parents: '1',
				interior: 'Here'
			}
		},
		{
			V3: {
				parents: '0',
				interior: {
					X1: {
						AccountId32: {
							network: null,
							id: accountId
						}
					}
				}
			}
		},
		{ V3: assets },
		'0',
		'Unlimited'
	);

	if (!tx) {
		return;
		// throw new Error(ERROR_MESSAGES.INVALID_TRANSACTION);
	}

	const getTransaction = (tx: SubmittableExtrinsic<'promise'>) => {
		if (isProxy) {
			return api.tx.proxy.proxy(proxyAddress, null, tx);
		}
		return tx;
	};

	const MAX_WEIGHT = (await tx.paymentInfo(address)).weight;
	const transaction = getTransaction(tx);
	const signableTransaction = api.tx.multisig.asMulti(threshold, signatories, null, transaction, MAX_WEIGHT);

	const afterSuccess = (tx: IGenericObject) => {
		const newTransaction = {
			callData: transaction.method.toHex(),
			callHash: transaction.method.hash.toString(),
			network,
			amountToken: formatBalance(
				amount.toString() || '0',
				{
					numberAfterComma: 3,
					withThousandDelimitor: false
				},
				network
			),
			recipientNetwork,
			to: recipientAddress || '',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender],
			initiator: sender
		} as IDashboardTransaction;
		console.log(tx, 'transaction hash');
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: signableTransaction as SubmittableExtrinsic<'promise'>,
		address: sender,
		params,
		onSuccess: afterSuccess,
		onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const createProxy = async ({
	api,
	multisig,
	sender: substrateSender,
	onSuccess,
	onFailed
}: ICreateProxyTransaction) => {
	// Multisig info
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;
	// Zero weight
	const ZERO_WEIGHT = new Uint8Array(0);

	// Sort signatories
	const signatories = allSignatories
		.map((s) => getEncodedAddress(s, network) || s)
		.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));
	if (!api || !api.isReady) {
		throw new Error(ERROR_MESSAGES.API_NOT_CONNECTED);
	}
	const proxyTx = api.tx.proxy.createPure('Any', 0, new Date().getMilliseconds());
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, proxyTx, ZERO_WEIGHT);

	const afterSuccess = (tx: IGenericObject) => {
		const newTransaction = {
			callData: proxyTx.method.toHex(),
			callHash: proxyTx.method.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		onFailed: onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const cancelTransaction = async ({
	api,
	multisig,
	sender: substrateSender,
	callHash,
	onSuccess,
	onFailed
}: ICancelTransaction) => {
	const { network, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	console.log('sender in cancel', sender);
	// Sort signatories
	const signatories = allSignatories
		.map((s) => getEncodedAddress(s, network) || s)
		.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));
	console.log('signatories in cancel', signatories);

	if (!callHash) {
		console.log('invalid callHash');
		return;
	}
	const info: any = await api.query.multisig.multisigs(multisig.address, callHash);
	const TIME_POINT = info.unwrap().when;

	const tx = api.tx.multisig.cancelAsMulti(multisig.threshold, signatories, TIME_POINT, callHash);

	const afterSuccess = () => {
		onSuccess && onSuccess({ callHash });
	};

	return {
		api,
		apiReady: true,
		tx: tx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		onFailed: onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const approveTransaction = async ({
	api,
	multisig,
	sender: substrateSender,
	calldata,
	callHash,
	onSuccess,
	onFailed
}: IApproveTransaction) => {
	const { network, signatories: allSignatories, threshold, address } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;
	console.log('sender in approve', sender);
	// Sort signatories
	const signatories = allSignatories
		.map((s) => getEncodedAddress(s, network) || s)
		.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));

	if (!calldata) {
		console.log('invalid calldata');
		return;
	}
	const callDataHex = api.createType('Call', calldata);
	const { weight } = await calcWeight(callDataHex, api);

	const multisigInfos = await getMultisigInfo(address, api);
	const [, multisigInfo] = multisigInfos?.find(([h]) => h.eq(callHash)) || [null, null];

	if (!multisigInfo) {
		console.log('No multisig info found');
		return;
	}

	const approveTx = api.tx.multisig.asMulti(threshold, signatories, multisigInfo.when, callDataHex, weight);

	const afterSuccess = () => {
		onSuccess && onSuccess({ callHash });
	};

	return {
		api,
		apiReady: true,
		tx: approveTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		onFailed: onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const editProxy = async ({
	api,
	newSignatories,
	newThreshold,
	multisig,
	proxyAddress,
	sender: substrateSender,
	onSuccess,
	onFailed
}: IEditMultisigTransaction) => {
	// Multisig info
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	// Sort signatories
	const signatories = allSignatories
		.map((s) => getEncodedAddress(s, network) || s)
		.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender));

	if (!newThreshold || !newSignatories || newSignatories.length < 2) {
		throw new Error(ERROR_MESSAGES.INVALID_TRANSACTION);
	}
	const encodedSignatories = newSignatories.map((signatory) =>
		encodeAddress(signatory, networkConstants[network].ss58Format)
	);
	const newMultisigAddress = encodeMultiAddress(encodedSignatories, newThreshold);
	const accountId = getEncodedAddress(newMultisigAddress, network);
	const addProxyTx = api.tx.proxy.addProxy(accountId, 'Any', 0);
	const removeProxyTx = api.tx.proxy.removeProxy(address, 'Any', 0);
	const addAndRemoveProxyTx = api.tx.utility.batchAll([addProxyTx, removeProxyTx]);

	const proxyTx = api.tx.proxy.proxy(proxyAddress, null, addAndRemoveProxyTx);
	const callData = api.createType('Call', proxyTx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, proxyTx, MAX_WEIGHT as any);

	const afterSuccess = () => {
		const newTransaction = {
			callData: proxyTx.method.toHex(),
			callHash: proxyTx.method.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		onFailed: onFailed,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const setIdentity = async ({
	api,
	data,
	multisig,
	sender: substrateSender,
	onSuccess
}: ISetIdentityMultisigTransaction) => {
	// Multisig info
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	const signatories = sortAddresses(
		allSignatories.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender)),
		networkConstants[network].ss58Format
	);

	const { displayName, email, legalName, elementHandle, twitterHandle, websiteUrl } = data;

	const args = {
		additional: [],
		display: createRawObject(displayName),
		email: createRawObject(email),
		legal: createRawObject(legalName),
		pgpFingerprint: null,
		riot: createRawObject(elementHandle),
		twitter: createRawObject(twitterHandle),
		web: createRawObject(websiteUrl)
	};

	const tx = api.tx.identity.setIdentity(args);

	const regIndex = getIdentityRegistrarIndex(network);
	const registrars: any = await api.query.identity.registrars().then((e) => JSON.parse(e.toString()));
	console.log(regIndex);
	const judgment = regIndex && api.tx.identity.requestJudgement(regIndex, registrars?.[regIndex]?.fee || new BN(0));
	const identityTx = judgment ? api.tx.utility.batchAll([tx, judgment]) : tx;
	const callData = api.createType('Call', identityTx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, identityTx, MAX_WEIGHT as any);

	const afterSuccess = () => {
		const newTransaction = {
			callData: tx.method.toHex(),
			callHash: tx.method.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const delegate = async ({
	api,
	proxyAddress,
	proxyType,
	multisig,
	sender: substrateSender,
	onSuccess
}: IDelegateMultisigTransaction) => {
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	const signatories = sortAddresses(
		allSignatories.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender)),
		networkConstants[network].ss58Format
	);

	const tx = api.tx.proxy.addProxy(proxyAddress, proxyType, 0);
	const callData = api.createType('Call', tx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, tx, MAX_WEIGHT as any);
	const afterSuccess = () => {
		const newTransaction = {
			callData: tx.method.toHex(),
			callHash: tx.method.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const callData = async ({
	api,
	callDataString,
	multisig,
	type,
	proxyAddress,
	sender: substrateSender,
	onSuccess
}: ICallDataMultisigTransaction) => {
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	const signatories = sortAddresses(
		allSignatories.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender)),
		networkConstants[network].ss58Format
	);

	const callData = api.createType('Call', callDataString);

	let tx = api.tx(callData);

	if (type === ETransactionCreationType.SUBMIT_PREIMAGE) {
		tx = api.tx.preimage.notePreimage(callDataString);
	}

	if (proxyAddress) {
		tx = api.tx.proxy.proxy(proxyAddress, null, tx);
	}
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, tx, MAX_WEIGHT as any);
	const afterSuccess = (tx: IGenericObject) => {
		const newTransaction = {
			callData: callData.toHex(),
			callHash: callData.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const cancelOrKill = async ({
	api,
	sender: substrateSender,
	multisig,
	postIndex,
	type,
	onSuccess
}: {
	api: ApiPromise;
	multisig: IMultisig;
	proxyAddress?: string;
	postIndex: Number;
	sender: string;
	type: EProposalType;
	onSuccess: (data: IGenericObject) => void;
}) => {
	const { address, network, threshold, signatories: allSignatories } = multisig;
	const sender = getEncodedAddress(substrateSender, network) || substrateSender;

	// Sort signatories
	const signatories = sortAddresses(
		allSignatories.filter((s) => getSubstrateAddress(s) !== getSubstrateAddress(sender)),
		networkConstants[network].ss58Format
	);

	const proposal =
		type === EProposalType.CANCEL
			? api.tx.referenda.cancel(Number(postIndex))
			: api.tx.referenda.kill(Number(postIndex));
	const proposalPreImage = createPreImage(api, proposal);
	const preImageTx = proposalPreImage.notePreimageTx;
	const origin: any = { Origins: PostOrigin.REFERENDUM_CANCELLER };
	const proposalTx = api.tx.referenda.submit(
		origin,
		{ Lookup: { hash: proposalPreImage.preimageHash, len: proposalPreImage.preimageLength } },
		{ After: BN_HUNDRED }
	);
	const tx = api.tx.utility.batchAll([preImageTx, proposalTx as any]);
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);
	const mainTx = api.tx.multisig.asMulti(threshold, signatories, null, tx, MAX_WEIGHT as any);

	const afterSuccess = () => {
		const newTransaction = {
			callData: tx.method.toHex(),
			callHash: tx.method.hash.toString(),
			network,
			amountToken: '0',
			createdAt: new Date(),
			multisigAddress: address,
			from: address,
			approvals: [sender]
		} as IDashboardTransaction;
		console.log(newTransaction, 'Transaction');
		onSuccess && onSuccess({ newTransaction });
	};

	return {
		api,
		apiReady: true,
		tx: mainTx as SubmittableExtrinsic<'promise'>,
		address: sender,
		onSuccess: afterSuccess,
		network,
		errorMessageFallback: ERROR_MESSAGES.TRANSACTION_FAILED
	};
};

const TRANSACTION_BUILDER = {
	[ETxType.FUND]: fund,
	[ETxType.TRANSFER]: transfer,
	[ETxType.CREATE_PROXY]: createProxy,
	[ETxType.CANCEL]: cancelTransaction,
	[ETxType.APPROVE]: approveTransaction,
	[ETxType.EDIT_PROXY]: editProxy,
	[ETxType.SET_IDENTITY]: setIdentity,
	[ETxType.DELEGATE]: delegate,
	[ETxType.TELEPORT]: teleportAssets,
	[ETxType.CALL_DATA]: callData,
	[ETxType.CANCEL_OR_KILL]: cancelOrKill
};

export { TRANSACTION_BUILDER };
