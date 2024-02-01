// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

export interface IHistoryTransactions {
	amount_token: string;
	created_at: Date;
	data: string;
	decodedData: any;
	approvals: string[];
	executed: boolean;
	network: string;
	safeAddress: string;
	signatures: Array<{ address: string; signature: string }>;
	to: string;
	txHash: string;
	type: string;
	executor: string;
	from: string;
	advancedDetails?: any;
	receivedTransfers?: any[];
}
export const convertSafeHistoryData = (data: any, multisigAddress?: string) => {
	const advancedDetails = {
		operation: data?.operation,
		nonce: data?.nonce,
		safeTxGas: data?.safeTxGas,
		baseGas: data?.baseGas,
		gasPrice: data?.gasPrice,
		gasToken: data?.gasToken,
		refundReceiver: data?.refundReceiver
	};
	const convertedData: IHistoryTransactions = {
		advancedDetails,
		amount_token: data?.value || data?.transfers?.[0]?.value || '0',
		approvals: data?.confirmations?.map((user: any) => user?.owner || '') || [],
		created_at: data?.executionDate || new Date(),
		data: data?.data,
		decodedData: data?.dataDecoded,
		executed: data?.isExecuted,
		executor: data?.executor || data?.from,
		from: data?.from || '',
		network: data?.network,
		safeAddress: data?.safe || multisigAddress || '',
		signatures:
			data?.confirmations?.map((user: any) => ({ address: user?.owner || '', signature: user?.signature || '' })) || [],
		to: data?.to,
		txHash: data?.safeTxHash || data?.txHash,
		type: data?.txType || data?.dataDecoded?.method || 'Custom',
		receivedTransfers: data?.transfers || []
	};
	return convertedData;
};
