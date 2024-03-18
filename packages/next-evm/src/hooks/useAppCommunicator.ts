/* eslint-disable consistent-return */
/* eslint-disable sort-keys */
/* eslint-disable @typescript-eslint/no-shadow */
import type { MutableRefObject } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type {
	SafeAppData,
	ChainInfo as WebCoreChainInfo,
	TransactionDetails,
	RpcUri
} from '@safe-global/safe-gateway-typescript-sdk';

import type {
	AddressBookItem,
	BaseTransaction,
	EIP712TypedData,
	EnvironmentInfo,
	GetBalanceParams,
	GetTxBySafeTxHashParams,
	RequestId,
	RPCPayload,
	SafeInfo,
	SendTransactionRequestParams,
	SignMessageParams,
	SignTypedMessageParams,
	ChainInfo,
	SafeBalances,
	SafeSettings
} from '@safe-global/safe-apps-sdk';
import { Methods, RPC_CALLS } from '@safe-global/safe-apps-sdk';
import AppCommunicator from '@next-evm/services/AppCommunicator';
import { ethers } from 'ethers';

export enum CommunicatorMessages {
	REJECT_TRANSACTION_MESSAGE = 'Transaction was rejected'
}

type JsonRpcResponse = {
	jsonrpc: string;
	id: number;
	result?: any;
	error?: string;
};

export type UseAppCommunicatorHandlers = {
	onConfirmTransactions: (txs: BaseTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) => void;
	onSignMessage: (
		message: string | EIP712TypedData,
		requestId: string,
		method: Methods.signMessage | Methods.signTypedMessage,
		sdkVersion: string
	) => void;
	onGetTxBySafeTxHash: (transactionId: string) => Promise<TransactionDetails>;
	onGetEnvironmentInfo: () => EnvironmentInfo;
	onGetSafeBalances: (currency: string) => Promise<SafeBalances>;
	onGetSafeInfo: () => SafeInfo;
	onGetChainInfo: () => ChainInfo | undefined;
	onRequestAddressBook: (origin: string) => AddressBookItem[];
	onSetSafeSettings: (settings: SafeSettings) => SafeSettings;
	onGetOffChainSignature: (messageHash: string) => Promise<string | undefined>;
};

export const createSafeAppsWeb3Provider = (
	safeAppsRpcUri: RpcUri,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	customRpc?: string
): ethers.providers.JsonRpcProvider | undefined => {
	if (!safeAppsRpcUri.value) return;
	return new ethers.providers.JsonRpcProvider(safeAppsRpcUri.value);
};

const useAppCommunicator = (
	iframeRef: MutableRefObject<HTMLIFrameElement | null>,
	app: SafeAppData | undefined,
	chain: WebCoreChainInfo | undefined,
	handlers: UseAppCommunicatorHandlers
): AppCommunicator | undefined => {
	const [communicator, setCommunicator] = useState<AppCommunicator | undefined>(undefined);

	const safeAppWeb3Provider = useMemo(() => {
		if (!chain) {
			return;
		}

		return createSafeAppsWeb3Provider(chain.rpcUri);
	}, [chain]);

	useEffect(() => {
		let communicatorInstance: AppCommunicator;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const initCommunicator = (iframeRef: MutableRefObject<HTMLIFrameElement>, app?: SafeAppData) => {
			communicatorInstance = new AppCommunicator(iframeRef, {
				onMessage: (msg) => {
					// eslint-disable-next-line no-useless-return
					if (!msg.data) return;
				},
				onError: (error) => {
					console.log('error', error.message);
				}
			});

			setCommunicator(communicatorInstance);
		};

		if (app) {
			initCommunicator(iframeRef as MutableRefObject<HTMLIFrameElement>, app);
		}

		return () => {
			communicatorInstance?.clear();
		};
	}, [app, iframeRef]);

	// Adding communicator logic for the required SDK Methods
	// We don't need to unsubscribe from the events because there can be just one subscription
	// per event type and the next effect run will simply replace the handlers
	useEffect(() => {
		communicator?.on(Methods.getTxBySafeTxHash, (msg) => {
			const { safeTxHash } = msg.data.params as GetTxBySafeTxHashParams;

			return handlers.onGetTxBySafeTxHash(safeTxHash);
		});

		communicator?.on(Methods.getEnvironmentInfo, handlers.onGetEnvironmentInfo);

		communicator?.on(Methods.getSafeInfo, handlers.onGetSafeInfo);

		communicator?.on(Methods.getSafeBalances, (msg) => {
			const { currency = 'usd' } = msg.data.params as GetBalanceParams;

			return handlers.onGetSafeBalances(currency);
		});

		communicator?.on(Methods.rpcCall, async (msg) => {
			const params = msg.data.params as RPCPayload;

			if (params.call === RPC_CALLS.safe_setSettings) {
				const settings = params.params[0] as SafeSettings;
				return handlers.onSetSafeSettings(settings);
			}

			if (!safeAppWeb3Provider) {
				throw new Error('SafeAppWeb3Provider is not initialized');
			}

			try {
				// eslint-disable-next-line @typescript-eslint/return-await
				return await safeAppWeb3Provider.send(params.call, params.params);
			} catch (err) {
				throw new Error((err as JsonRpcResponse).error);
			}
		});

		communicator?.on(Methods.signMessage, (msg) => {
			const { message } = msg.data.params as SignMessageParams;
			const { sdkVersion } = msg.data.env;
			handlers.onSignMessage(message, msg.data.id, Methods.signMessage, sdkVersion);
		});

		communicator?.on(Methods.getOffChainSignature, (msg) => {
			return handlers.onGetOffChainSignature(msg.data.params as string);
		});

		communicator?.on(Methods.signTypedMessage, (msg) => {
			const { typedData } = msg.data.params as SignTypedMessageParams;
			const { sdkVersion } = msg.data.env;
			handlers.onSignMessage(typedData, msg.data.id, Methods.signTypedMessage, sdkVersion);
		});

		communicator?.on(Methods.getChainInfo, handlers.onGetChainInfo);

		communicator?.on(Methods.requestAddressBook, (msg) => {
			return handlers.onRequestAddressBook(msg.origin);
		});
	}, [safeAppWeb3Provider, handlers, chain, communicator]);

	return communicator;
};

export default useAppCommunicator;
