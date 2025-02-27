// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import {
	EAfterExecute,
	ENetwork,
	ETransactionOptions,
	ETransactionType,
	ETransactionVariant,
	ETriggers,
	ETxType
} from '@common/enum/substrate';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { TransactionHead } from '@common/global-ui-components/Transaction/TransactionHead';
import TransactionDetails from '@common/global-ui-components/Transaction/TransactionDetails';
import { findMultisig } from '@common/utils/findMultisig';
import { ApiPromise } from '@polkadot/api';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useDecodeCallData } from '@substrate/app/global/hooks/queryHooks/useDecodeCallData';
import { useAllAPI } from '@substrate/app/global/hooks/useAllAPI';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';
import { Collapse } from 'antd';
import { twMerge } from 'tailwind-merge';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import { useHistoryAtom, useQueueAtom } from '@substrate/app/atoms/transaction/transactionAtom';
import {
	IGenericObject,
	IMultisig,
	IOrganisation,
	IReviewTransaction,
	ISubstrateExecuteProps,
	ITxnCategory
} from '@common/types/substrate';
import { ERROR_MESSAGES, INFO_MESSAGES, SUCCESS_MESSAGES } from '@common/utils/messages';
import { useNotification } from '@common/utils/notification';
import { TRANSACTION_BUILDER } from '@substrate/app/global/utils/transactionBuilder';
import { useState } from 'react';
import { setSigner } from '@substrate/app/global/utils/setSigner';
import { executeTx } from '@substrate/app/global/utils/executeTransaction';
import { AFTER_EXECUTE } from '@substrate/app/global/utils/afterExceute';
import { sendNotification } from '@sdk/polkasafe-sdk/src';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import TransactionFields, {
	generateCategoryKey
} from '@substrate/app/(Main)/transactions/components/TransactionFields';
import { useQueueDetails } from '@substrate/app/global/hooks/queryHooks/useQueueDetails';
import { useTestDecode } from '@substrate/app/global/hooks/queryHooks/useTestDecode';
import { useGetMultisigCallDataAndSigner } from '@substrate/app/global/hooks/queryHooks/useGetCallData';
import { IDashboardTransaction } from '@common/types/substrate';

interface ITransactionRow {
	callData?: string;
	callHash: string;
	createdAt: Date;
	to: string;
	network: ENetwork;
	amountToken: string;
	from: string;
	type: ETransactionOptions;
	transactionType: ETransactionType;
	multisig: string;
	approvals: Array<string>;
	variant: ETransactionVariant;
	initiator: string;
	transactionFields?: ITxnCategory;
	multiId?: string;
	blockNumber: string;
	extrinsicIndex: number;
}

const getLabelForTransaction = (type: ETransactionOptions, label?: string) => {
	switch (type) {
		case ETransactionOptions.SENT:
			return 'Sent';
		case ETransactionOptions.RECEIVED:
			return 'Received';
		case ETransactionOptions.EDIT_SIGNATORY:
			return 'EDIT Signatory';
		case ETransactionOptions.CREATE_PROXY:
			return 'Create Proxy';
		case ETransactionOptions.CUSTOM:
			return label || 'Custom';
		default:
			return label || 'Custom';
	}
};

const getTransactionDetail = (data: Array<any>, network: ENetwork) => {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return {
			label: '',
			amount: 0,
			to: []
		};
	}

	const transaction: any = {};
	const recipientsAndAmount: Array<any> = [];
	for (let txData of data) {
		// LABEL
		if (txData.section === 'proxy' && txData.method === 'createPure') {
			transaction.label = ETransactionOptions.CREATE_PROXY;
		} else if (txData.section === 'proxy' && txData.method === 'addProxy') {
			transaction.label = ETransactionOptions.EDIT_SIGNATORY;
		} else if (
			(txData.section === 'balances' && txData.method === 'transferKeepAlive') ||
			(txData.section === 'assets' && txData.method === 'transfer') ||
			(txData.section === 'assets' && txData.method === 'reserveTransferAssets') ||
			(txData.section === 'balances' && txData.method === 'transfer')
		) {
			transaction.label = ETransactionOptions.SENT;
		} else {
			transaction.label = `${txData.section}.${txData.method}`;
		}
		// AMOUNT
		if (txData.section === 'balances' && txData.method === 'transferKeepAlive') {
			const recipient = txData.to;
			const amount = txData.value?.split(',').join('');

			recipientsAndAmount.push({
				address: recipient,
				currency: networkConstants[network].tokenSymbol,
				amount: formatBalance(amount, { numberAfterComma: 4 }, network)
			});
		}
		if (txData.section === 'assets' && txData.method === 'transfer') {
			const recipient = txData?.transfer?.target;
			const amount = txData?.transfer?.amount?.split(',').join('');
			const assetId = txData?.transfer?.assetId?.split(',').join('');
			const currency = networkConstants[network].supportedTokens.find(
				(token) => String(token.id) === String(assetId)
			)?.symbol;
			const decimals = networkConstants[network].supportedTokens.find(
				(token) => String(token.id) === String(assetId)
			)?.decimals;
			recipientsAndAmount.push({
				address: recipient,
				currency,
				amount: formatBalance(amount, { numberAfterComma: 4 }, network, decimals)
			});
		}
		if (txData.section === 'proxy' && txData.method === 'proxy') {
			transaction.proxyAddress = txData.proxyAddress;
		}
	}
	transaction.to = recipientsAndAmount;

	return transaction;
};

function TransactionRow({
	callData: callDataFromProps,
	callHash,
	createdAt,
	to,
	network,
	amountToken,
	from,
	type,
	transactionType,
	multisig,
	approvals = [],
	variant = ETransactionVariant.SIMPLE,
	initiator,
	transactionFields,
	multiId,
	blockNumber,
	extrinsicIndex
}: ITransactionRow) {
	const { getApi } = useAllAPI();
	const [user] = useUser();
	const [organisation, setOrganisation] = useOrganisation();
	const [queueTransaction, setQueueTransactions] = useQueueAtom();
	const [historyTransaction, setHistoryTransaction] = useHistoryAtom();
	const notification = useNotification();

	const [category, setCategory] = useState<string>(
		transactionFields?.category ? generateCategoryKey(transactionFields?.category) : 'none'
	);

	const api = getApi(network);

	const [transactionFieldsObject, setTransactionFieldsObject] = useState<ITxnCategory>(
		transactionFields || { category: 'none', subfields: {} }
	);

	const { data: callDataAndSigner } = useGetMultisigCallDataAndSigner({
		blockNumber: Number(blockNumber),
		extrinsicIndex: Number(extrinsicIndex),
		apiData: api
	});

	const [callData] = callDataAndSigner?.split('-') || [];
	console.log('initiatorCC', initiator, user?.address);

	const isInitiator = getSubstrateAddress(initiator) === getSubstrateAddress(user?.address || '');

	const { data, isLoading, error } = useDecodeCallData({
		callData,
		callHash,
		apiData: api
	});

	// const { data: txDetails } = useQueueDetails({
	// 	extrinsicBlockWithIndex: `${blockNumber}-${extrinsicIndex}`,
	// 	network
	// });

	// const { data, isLoading, error } = useTestDecode({
	// 	blockNumber: Number(blockNumber),
	// 	extrinsicIndex: Number(extrinsicIndex),
	// 	callHash,
	// 	callData: callData as string,
	// 	apiData: api
	// });

	const transactionDetails = getTransactionDetail(data, network);

	const [executableTransaction, setExecutableTransaction] = useState<ISubstrateExecuteProps | null>(null);
	const [reviewTransaction, setReviewTransaction] = useState<IReviewTransaction | null>(null);

	console.log('multisig', organisation?.multisigs);
	console.log('multisig from props', multisig, network);

	const txMultisig = findMultisig(organisation?.multisigs || [], `${multisig}_${network}`);
	console.log('txMultisig', txMultisig);
	const isSignatory = txMultisig?.signatories
		.map((a) => getSubstrateAddress(a))
		.includes(getSubstrateAddress(user?.address || '') || '');

	const hasApproved = approvals
		.map((a) => getSubstrateAddress(a))
		.includes(getSubstrateAddress(user?.address || '') || '');

	const buildTransaction = async (type: ETxType) => {
		console.log('buildTransaction', type);
		const api = getApi(network)?.api;

		if (!api) {
			notification({ ...ERROR_MESSAGES.API_NOT_CONNECTED });
			return { error: true };
		}
		if (!user?.address) {
			notification({ ...ERROR_MESSAGES.INVALID_TRANSACTION });
			return { error: true };
		}
		if (!txMultisig) {
			notification({ ...ERROR_MESSAGES.WALLET_NOT_FOUND });
			return { error: true };
		}
		// After successful transaction add the transaction to the queue with the latest transaction on top
		const onSuccess = async ({ callHash }: IGenericObject) => {
			try {
				if (!callHash || !queueTransaction) {
					return;
				}
				if (type === ETxType.APPROVE) {
					const payload = (queueTransaction?.transactions || []).map(async (tx) => {
						if (tx.callHash === callHash) {
							const approvals = tx.approvals || [];
							if (!approvals.includes(user.address)) {
								approvals.push(user.address);
							}
							const multisig = findMultisig(organisation?.multisigs || [], `${tx.multisigAddress}_${tx.network}`);
							if (approvals.length === multisig?.threshold) {
								// Add new proxy to DB
								const isEditProxyTransaction = data.find(
									(d: IGenericObject) => d.method === 'addProxy' && d.section === 'proxy'
								);
								const isRemoveTransaction = data.find(
									(d: IGenericObject) => d.method === 'removeProxy' && d.section === 'proxy'
								);
								const proxy = data.find((d: IGenericObject) => d.method === 'proxy' && d.section === 'proxy');
								if (tx.callModule === 'Proxy' && tx.callModuleFunction === 'create_pure') {
									const data = (await AFTER_EXECUTE[EAfterExecute.LINK_PROXY]({
										multisigAddress: txMultisig.address,
										network: txMultisig.network,
										address: user.address,
										signature: user.signature
									})) as IGenericObject;
									const filteredMultisig = organisation?.multisigs.map((multisig) => {
										if (multisig.address === txMultisig.address && multisig.network === txMultisig.network) {
											return {
												...multisig,
												proxy: multisig.proxy.push({ address: data.proxy, name: '' })
											};
										}
										return multisig;
									}) as Array<IMultisig>;

									const payload = {
										...organisation,
										multisigs: filteredMultisig
									} as IOrganisation;

									setOrganisation(payload);

									sendNotification({
										address: user.address,
										signature: user.signature,
										args: {
											address: user.address,
											addresses:
												multisig?.signatories.filter(
													(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
												) || [],
											callHash: callHash,
											multisigAddress: txMultisig.address,
											network
										},
										trigger: ETriggers.EXECUTED_PROXY
									});
								}
								// Link old proxy to new multisig
								else if (isEditProxyTransaction && isRemoveTransaction) {
									AFTER_EXECUTE[EAfterExecute.EDIT_PROXY]({
										organisationId: organisation?.id || '',
										newMultisigAddress: isEditProxyTransaction.delegate,
										oldMultisigAddress: isRemoveTransaction.delegate,
										proxyAddress: proxy.proxyAddress,
										network: txMultisig.network,
										address: user.address,
										signature: user.signature
									});
									let flag = false;
									const filteredMultisig = organisation?.multisigs.map((multisig) => {
										if (multisig.address === isRemoveTransaction.delegate && multisig.network === txMultisig.network) {
											return {
												...multisig,
												proxy: multisig.proxy.filter((p) => p.address !== proxy.proxyAddress)
											};
										}
										if (
											multisig.address === isEditProxyTransaction.delegate &&
											multisig.network === txMultisig.network
										) {
											{
												flag = true;
												return {
													...multisig,
													proxy: [...multisig.proxy, { address: proxy.proxyAddress, name: '' }]
												};
											}
										}
										return multisig;
									}) as Array<IMultisig>;

									const payload = {
										...organisation,
										multisigs: filteredMultisig
									} as IOrganisation;

									setOrganisation(payload);

									sendNotification({
										address: user.address,
										signature: user.signature,
										args: {
											address: user.address,
											addresses:
												multisig?.signatories.filter(
													(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
												) || [],
											callHash: callHash,
											multisigAddress: txMultisig.address,
											network
										},
										trigger: ETriggers.EDIT_MULTISIG_USERS_EXECUTED
									});
								} else {
									sendNotification({
										address: user.address,
										signature: user.signature,
										args: {
											address: user.address,
											addresses:
												multisig?.signatories.filter(
													(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
												) || [],
											callHash: callHash,
											multisigAddress: txMultisig.address,
											network
										},
										trigger: ETriggers.EXECUTED_TRANSACTION
									});
								}

								if (!historyTransaction) {
									return null;
								}

								setHistoryTransaction({
									...historyTransaction,
									transactions: [tx, ...historyTransaction.transactions]
								});
								return null;
							}

							return { ...tx, approvals };
						}
						return tx;
					});

					const txWithNull = await Promise.all(payload);

					const transactions = txWithNull.filter((tx) => tx !== null) as Array<IDashboardTransaction>;

					setQueueTransactions({ ...queueTransaction, transactions });
					notification(SUCCESS_MESSAGES.TRANSACTION_APPROVE_SUCCESS);
				} else {
					const payload = (queueTransaction?.transactions || []).map((tx) => {
						const multisig = findMultisig(organisation?.multisigs || [], `${tx.multisigAddress}_${tx.network}`);
						if (tx.callHash === callHash)
							sendNotification({
								address: user.address,
								signature: user.signature,
								args: {
									address: user.address,
									addresses:
										multisig?.signatories.filter(
											(signatory) => getSubstrateAddress(signatory) !== getSubstrateAddress(user?.address || '')
										) || [],
									callHash: callHash,
									multisigAddress: txMultisig.address,
									network
								},
								trigger: ETriggers.CANCELLED_TRANSACTION
							});
						return tx.callHash === callHash ? null : tx;
					});

					const transactions = payload.filter((tx) => tx !== null);

					setQueueTransactions({ ...queueTransaction, transactions: transactions as Array<IDashboardTransaction> });
					notification(SUCCESS_MESSAGES.TRANSACTION_REJECT_SUCCESS);
				}
			} catch (error) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: error instanceof Error ? error.message : String(error) });
			}
		};

		try {
			const transaction = await (type === ETxType.APPROVE
				? TRANSACTION_BUILDER[ETxType.APPROVE]({
						calldata: callData as string,
						callHash,
						api: api as ApiPromise,
						sender: user.address,
						multisig: txMultisig,
						onSuccess,
						onFailed: () => {}
					})
				: TRANSACTION_BUILDER[ETxType.CANCEL]({
						callHash,
						api: api as ApiPromise,
						sender: user.address,
						multisig: txMultisig,
						onSuccess,
						onFailed: () => {}
					}));

			if (!transaction) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
				return { error: true };
			}

			const fee = (await transaction.tx.paymentInfo(user.address)).partialFee;
			const formattedFee = formatBalance(
				fee.toString(),
				{
					numberAfterComma: 3,
					withThousandDelimitor: false
				},
				txMultisig.network
			);

			const reviewData = {
				tx: transaction.tx.method.toJSON(),
				from: txMultisig.address,
				txCost: formattedFee.toString(),
				network: txMultisig.network,
				name: txMultisig.name,
				createAt: new Date().toISOString()
			};
			setExecutableTransaction(transaction);
			setReviewTransaction(reviewData);
			return { error: false };
		} catch (error) {
			notification(ERROR_MESSAGES.CREATE_MULTISIG_FAILED);
			return { error: true };
		}
	};

	const signTransaction = async () => {
		try {
			if (!executableTransaction) {
				notification({ ...ERROR_MESSAGES.TRANSACTION_BUILD_FAILED });
				return { error: true };
			}

			await setSigner(executableTransaction.api, executableTransaction.network);
			await executeTx(executableTransaction);
			notification({ ...INFO_MESSAGES.TRANSACTION_IN_BLOCK });
			return { error: false };
		} catch (e) {
			notification({ ...ERROR_MESSAGES.TRANSACTION_FAILED, description: e instanceof Error ? e.message : String(e) });
			return { error: true };
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (variant === ETransactionVariant.SIMPLE) {
		return (
			<TransactionHead
				multiId={multiId}
				createdAt={createdAt}
				to={
					transactionDetails.to || [
						{ address: to, currency: networkConstants[network].tokenSymbol, amount: amountToken }
					]
				}
				callHash={callHash}
				callData={callData}
				network={network}
				amountToken={amountToken}
				from={from}
				label={transactionDetails.label}
				type={type}
				transactionType={transactionType}
				approvals={approvals}
				isHomePage
				threshold={txMultisig?.threshold || 2}
				hasApproved={hasApproved}
				signTransaction={signTransaction}
				reviewTransaction={reviewTransaction}
				onAction={buildTransaction}
				isSignatory={isSignatory}
				proxyAddress={transactionDetails.proxyAddress}
				initiator={isInitiator}
				updateTransactionFieldsComponent={
					<TransactionFields
						callHash={callHash}
						category={category}
						setCategory={setCategory}
						transactionFieldsObject={transactionFieldsObject}
						setTransactionFieldsObject={setTransactionFieldsObject}
						network={network}
						initiator={isSignatory || false}
						maxWidth={100}
					/>
				}
			/>
		);
	}

	return (
		<Collapse
			className={'bg-bg-secondary rounded-xl'}
			expandIconPosition='end'
			expandIcon={({ isActive }) => (
				<CircleArrowDownIcon className={twMerge('text-primary text-lg', isActive && 'rotate-[180deg]')} />
			)}
			// defaultActiveKey={[item.address]}
			items={[
				{
					key: callHash,
					label: (
						<TransactionHead
							multiId={multiId}
							createdAt={createdAt}
							to={
								transactionDetails.to || [
									{ address: to, currency: networkConstants[network].tokenSymbol, amount: amountToken }
								]
							}
							callHash={callHash}
							network={network}
							amountToken={transactionDetails.amount}
							from={from}
							proxyAddress={transactionDetails.proxyAddress}
							label={transactionDetails.label}
							type={type}
							transactionType={transactionType}
							approvals={approvals}
							threshold={txMultisig?.threshold || 2}
							hasApproved={hasApproved}
							signTransaction={signTransaction}
							reviewTransaction={reviewTransaction}
							onAction={buildTransaction}
							isSignatory={isSignatory}
							initiator={isInitiator}
							callData={callData}
							updateTransactionFieldsComponent={
								<TransactionFields
									callHash={callHash}
									category={category}
									setCategory={setCategory}
									transactionFieldsObject={transactionFieldsObject}
									setTransactionFieldsObject={setTransactionFieldsObject}
									network={network}
									initiator={isSignatory || false}
									maxWidth={100}
								/>
							}
						/>
					),
					children: (
						<TransactionDetails
							multiId={multiId}
							createdAt={createdAt}
							to={transactionDetails.to}
							network={network}
							amountToken={transactionDetails.amount}
							from={from}
							type={type}
							signatories={txMultisig?.signatories || []}
							transactionType={transactionType}
							approvals={approvals}
							threshold={txMultisig?.threshold || 2}
							hasApproved={hasApproved}
							callHash={callHash}
							callData={callData}
							signTransaction={signTransaction}
							reviewTransaction={reviewTransaction}
							onAction={buildTransaction}
							transactionFields={transactionFieldsObject}
							initiator={isInitiator}
							api={api?.api as ApiPromise}
							updateTransactionFieldsComponent={
								<TransactionFields
									callHash={callHash}
									category={category}
									setCategory={setCategory}
									transactionFieldsObject={transactionFieldsObject}
									setTransactionFieldsObject={setTransactionFieldsObject}
									network={network}
									initiator={isSignatory || false}
								/>
							}
						/>
					)
				}
			]}
		/>
	);
}

export default TransactionRow;
