// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDashboardTransaction } from '@common/types/substrate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTransaction = (transaction: any) => {
	return {
		multiId: transaction.multi_id || '',
		multisigAddress: transaction.multisigAddress,
		from: transaction.from,
		to: transaction.to || '',
		amountToken: transaction.amount_token,
		network: transaction.network,
		createdAt: transaction.created_at ? new Date(transaction.created_at) : new Date(),
		callData: transaction.callData,
		callHash: transaction.callHash,
		approvals: transaction.approvals,
		callModule: transaction.call_module,
		initiator: transaction.initiator,
		callModuleFunction: transaction.call_module_function,
		transactionFields: transaction.transactionFields
	} as unknown as IDashboardTransaction;
};
