// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import {
	EProposalType,
	ENetwork,
	ETransactionCreationType,
	ETransactionState,
	ETriggers,
	ETxType
} from '@common/enum/substrate';
import {
	ICallDataTransaction,
	ICancelOrKillTransaction,
	IConnectedUser,
	IDelegateTransaction,
	IGenericObject,
	IMultisig,
	IMultisigAssets,
	IReviewTransaction,
	ISendTransaction,
	ISetIdentityTransaction,
	ISubstrateExecuteProps,
	ITeleportAssetTransaction
} from '@common/types/substrate';
import { ApiPromise } from '@polkadot/api';
import { useAssets } from '@substrate/app/atoms/assets/assetsAtom';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { useAtomValue } from 'jotai';
import { DashboardProvider } from '@common/context/DashboarcContext';
import { selectedCurrencyAtom } from '@substrate/app/atoms/currency/currencyAtom';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useQueueAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import { ERROR_MESSAGES, INFO_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { PropsWithChildren, useState } from 'react';
import { setSigner } from '@substrate/app/global/utils/setSigner';
import { executeTx } from '@substrate/app/global/utils/executeTransaction';
import { TRANSACTION_BUILDER } from '@substrate/app/global/utils/transactionBuilder';
import { useNotification } from '@common/utils/notification';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import { sendNotification } from '@sdk/polkasafe-sdk/src';
import { findMultisig } from '@common/utils/findMultisig';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { updateTransaction } from '@sdk/polkasafe-sdk/src/transaction/callhash';
import { BN } from '@polkadot/util';

interface ISendTransactionProps {
	address: string | null;
	network?: ENetwork;
	proxyAddress: string | null;
}

export function SendTransaction({
	children,
	address,
	network,
	proxyAddress
}: PropsWithChildren<ISendTransactionProps>) {
	// Atoms Hooks
	const [data, setAssets] = useAssets();
	const currency = useAtomValue(selectedCurrencyAtom);
	const [organisation] = useOrganisation();
	const { getApi, allApi } = useAllAPI();
	const [user] = useUser();
	const [queueTransaction, setQueueTransactions] = useQueueAtom();

	const notification = useNotification();

	// States
	const [transactionState, setTransactionState] = useState(ETransactionState.BUILD);
	const [executableTransaction, setExecutableTransaction] = useState<ISubstrateExecuteProps | null>(null);
	const [reviewTransaction, setReviewTransaction] = useState<IReviewTransaction | null>(null);

	// Get multisig and proxy details
	const multisig = organisation?.multisigs?.find((item) => item.address === address && item.network === network);
	const allProxies = multisig?.proxy || [];
	const proxy = allProxies.find((item) => item.address === proxyAddress);
	const assets = data?.assets;

	const sendTokens = async (
		values: ISendTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { recipients, sender: multisig, selectedProxy, transactionFields } = values;
		const data = recipients.map((recipient) => ({
			amount: recipient.amount,
			recipient: recipient.address,
			currency: recipient.currency
		}));
		console.log('data', { recipients, multisig, selectedProxy, transactionFields });
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.TRANSFER]({
			api,
			data,
			params: {
				tip: values.tip
			},
			isProxy: Boolean(selectedProxy),
			proxyAddress: selectedProxy,
			multisig,
			sender: address,
			onSuccess
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			to: values.recipients[0]?.address || '',
			proxyAddress: values.selectedProxy || '',
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const teleport = async (
		values: ITeleportAssetTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { recipientAddress, sender: multisig, selectedProxy, recipientNetwork, amount } = values;
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.TELEPORT]({
			api,
			recipientAddress,
			recipientNetwork,
			amount,
			params: {
				tip: values.tip
			},
			isProxy: Boolean(selectedProxy),
			proxyAddress: selectedProxy,
			multisig,
			sender: address,
			onSuccess
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			to: recipientAddress || '',
			proxyAddress: values.selectedProxy || '',
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const setIdentity = async (
		values: ISetIdentityTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		peopleApi: ApiPromise | null,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { sender: multisig, displayName, legalName, elementHandle, websiteUrl, twitterHandle, email } = values;
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.SET_IDENTITY]({
			api:
				(multisig.network === ENetwork.POLKADOT || multisig.network === ENetwork.POLKADOT_ASSETHUB) && peopleApi
					? peopleApi
					: api,
			data: {
				displayName,
				legalName,
				elementHandle,
				websiteUrl,
				twitterHandle,
				email
			},
			multisig,
			sender: address,
			onSuccess,
			onFailed: () => {}
		})) as ISubstrateExecuteProps;

		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const delegation = async (
		values: IDelegateTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { proxyAddress, proxyType, sender: multisig } = values;
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.DELEGATE]({
			api,
			proxyAddress,
			proxyType,
			multisig,
			sender: address,
			onSuccess,
			onFailed: () => {}
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const callData = async (
		values: ICallDataTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { callData, sender: multisig, proxyAddress, type } = values;
		console.log('multisig', callData, multisig, proxyAddress);
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.CALL_DATA]({
			api,
			callDataString: callData,
			proxyAddress,
			multisig,
			sender: address,
			onSuccess,
			type,
			onFailed: () => {}
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const cancelOrKill = async (
		values: ICancelOrKillTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { postIndex, sender: multisig, proxyAddress, proposalType } = values;
		console.log('multisig', callData, multisig, proxyAddress);
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.CANCEL_OR_KILL]({
			api,
			proxyAddress,
			postIndex,
			multisig,
			sender: address,
			onSuccess,
			type: proposalType
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const createProposal = async (
		values: ICancelOrKillTransaction,
		user: IConnectedUser,
		api: ApiPromise,
		onSuccess: ({ newTransaction }: IGenericObject) => void
	) => {
		const { address } = user;
		const { postIndex, sender: multisig, proxyAddress, proposalType } = values;
		console.log('multisig', callData, multisig, proxyAddress);
		const transaction: ISubstrateExecuteProps = (await TRANSACTION_BUILDER[ETxType.CANCEL_OR_KILL]({
			api,
			proxyAddress,
			postIndex,
			multisig,
			sender: address,
			onSuccess,
			type: proposalType
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}

		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: values.sender?.address,
			txCost: formattedFee.toString(),
			network: values.sender.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	const buildTransaction = async (
		values:
			| ISendTransaction
			| ITeleportAssetTransaction
			| ISetIdentityTransaction
			| IDelegateTransaction
			| ICallDataTransaction
			| ICancelOrKillTransaction
	) => {
		if (!user) {
			notification({ ...ERROR_MESSAGES.AUTHENTICATION_FAILED });
			return;
		}
		console.log('values', values);
		// After successful transaction add the transaction to the queue with the latest transaction on top
		const onSuccess = ({ newTransaction }: IGenericObject) => {
			try {
				if (!queueTransaction) {
					return;
				}
				const transactionFields = (values as ISendTransaction).transactionFields;
				const newTransactionWithCategories = { ...newTransaction, transactionFields };
				const payload = [newTransactionWithCategories, ...(queueTransaction?.transactions || [])];
				const { callHash, network, multisigAddress } = newTransaction;
				const multisig = findMultisig(organisation?.multisigs || [], multisigAddress);

				setQueueTransactions({ ...queueTransaction, transactions: payload });
				notification(SUCCESS_MESSAGES.TRANSACTION_SUCCESS);
				updateTransaction({
					address: user.address,
					signature: user.signature,
					callhash: callHash,
					transaction: newTransactionWithCategories
				});
				sendNotification({
					address: user?.address,
					signature: user?.signature,
					args: {
						address: user?.address,
						addresses:
							multisig?.signatories.filter(
								(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
							) || [],
						callHash,
						multisigAddress,
						network
					},
					trigger: ETriggers.INIT_MULTISIG_TRANSFER
				});
			} catch (error) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error instanceof Error ? error.message : String(error) });
			}
		};
		try {
			if (!user) {
				notification({ ...ERROR_MESSAGES.AUTHENTICATION_FAILED });
				return;
			}
			const { sender: multisig, type } = values;
			const apiAtom = getApi(multisig.network);
			if (!apiAtom) {
				notification({ ...ERROR_MESSAGES.API_NOT_CONNECTED });
				return;
			}
			const { api } = apiAtom as { api: ApiPromise };
			if (!api || !api.isReady) {
				notification({ ...ERROR_MESSAGES.API_NOT_CONNECTED });
				return;
			}

			switch (type) {
				case ETransactionCreationType.SEND_TOKEN:
					await sendTokens(values as ISendTransaction, user, api, onSuccess);
					break;

				case ETransactionCreationType.TELEPORT:
					await teleport(values as ITeleportAssetTransaction, user, api, onSuccess);
					break;

				case ETransactionCreationType.SET_IDENTITY:
					await setIdentity(values as ISetIdentityTransaction, user, api, api, onSuccess);
					break;

				case ETransactionCreationType.DELEGATE:
					await delegation(values as IDelegateTransaction, user, api, onSuccess);
					break;

				case ETransactionCreationType.CREATE_PROPOSAL: {
					const { proposalType } = values as ICancelOrKillTransaction;
					if (proposalType === EProposalType.CANCEL || proposalType === EProposalType.KILL) {
						await cancelOrKill(values as ICancelOrKillTransaction, user, api, onSuccess);
					}
					if (proposalType === EProposalType.CREATE) {
						await cancelOrKill(values as ICancelOrKillTransaction, user, api, onSuccess);
					}
					break;
				}

				case ETransactionCreationType.CALL_DATA:
				case ETransactionCreationType.SUBMIT_PREIMAGE:
				case ETransactionCreationType.MANUAL_EXTRINSIC:
					await callData(values as ICallDataTransaction, user, api, onSuccess);
					break;
			}
		} catch (error) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error instanceof Error ? error.message : String(error) });
			console.log(error);
		}
	};

	const signTransaction = async () => {
		try {
			if (!executableTransaction) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
				return;
			}

			await setSigner(executableTransaction.api, executableTransaction.network);
			await executeTx(executableTransaction);
			notification({ ...INFO_MESSAGES.TRANSACTION_IN_BLOCK });
			setTransactionState(ETransactionState.CONFIRM);
		} catch (e) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: e instanceof Error ? e.message : String(e) });
			setTransactionState(ETransactionState.FAILED);
		}
	};

	const fundTransaction = async ({
		multisig,
		amount,
		selectedProxy
	}: {
		amount: BN;
		multisig: IMultisig;
		selectedProxy?: string;
	}) => {
		if (!user) {
			return;
		}

		const { address } = user;
		const apiAtom = getApi(multisig.network);
		if (!apiAtom) {
			return;
		}
		const { api } = apiAtom as { api: ApiPromise };
		if (!api || !api.isReady) {
			return;
		}

		const transaction = (await TRANSACTION_BUILDER[ETxType.FUND]({
			api,
			data: [{ amount: new BN(amount), recipient: selectedProxy || multisig.address }],
			multisig,
			sender: address,
			onSuccess: () => {
				data?.refetch();
			}
		})) as ISubstrateExecuteProps;
		if (!transaction) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
			return;
		}
		const fee = (await transaction.tx.paymentInfo(address)).partialFee;
		const formattedFee = formatBalance(
			fee.toString(),
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			multisig.network
		);

		const reviewData = {
			tx: transaction.tx.toHuman(),
			from: address,
			to: selectedProxy || multisig.address,
			txCost: formattedFee.toString(),
			network: multisig.network,
			createAt: new Date().toISOString()
		} as IReviewTransaction;
		setExecutableTransaction(transaction);
		setReviewTransaction(reviewData);
		setTransactionState(ETransactionState.REVIEW);
	};

	return (
		<DashboardProvider
			buildTransaction={buildTransaction}
			signTransaction={signTransaction}
			onFundMultisig={fundTransaction}
			reviewTransaction={reviewTransaction}
			assets={assets || null}
			currency={currency}
			multisigs={
				multisig
					? [multisig]
					: (organisation?.multisigs || []).filter((item) =>
							item.signatories.map((a) => getSubstrateAddress(a)).includes(getSubstrateAddress(user?.address || ''))
						)
			}
			addressBook={organisation?.addressBook || []}
			transactionFields={organisation?.transactionFields || {}}
			allApi={allApi}
			transactionState={transactionState}
			setTransactionState={setTransactionState}
		>
			{children}
		</DashboardProvider>
	);
}
