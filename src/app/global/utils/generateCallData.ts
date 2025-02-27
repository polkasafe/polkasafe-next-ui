import { ETransactionCalls } from '@common/enum/substrate';
import { ApiPromise } from '@polkadot/api';

interface IGenerateTransactionCall {
	multisig: string;
	api: ApiPromise;
	type: ETransactionCalls;
}

export const generateCallData = async ({ multisig, api, type }: IGenerateTransactionCall) => {
	switch (type) {
		case ETransactionCalls.PROXY:
			const tx = api.tx.proxy.createPure('Any', 0, new Date().getMilliseconds());
			return tx.method.toHex();
		default:
			return null;
	}
};
