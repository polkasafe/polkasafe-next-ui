/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sort-keys */
import React, { useEffect, useRef, useState } from 'react';
import useAppCommunicator from '@next-evm/hooks/useAppCommunicator';
import {
	BaseTransaction,
	SendTransactionRequestParams,
	EIP712TypedData,
	Methods,
	EnvironmentInfo,
	AddressBookItem,
	SafeSettings
} from '@safe-global/safe-apps-sdk';
import { SafeAppData, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import useGetSafeInfo from '@next-evm/hooks/useGetSafeInfo';
import { TxEvent, txSubscribe } from '@next-evm/services/tx/txEvents';
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@next-evm/services/analytics';
import { SafeMsgEvent, safeMsgSubscribe } from '@next-evm/services/safeMsgEvents';

type SafeAppDataWithPermissions = SafeAppData;

const AppFrame = ({
	appUrl,
	safeAppFromManifest
}: {
	appUrl: string;
	safeAppFromManifest: SafeAppDataWithPermissions;
}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [settings, setSettings] = useState<SafeSettings>({
		offChainSigning: true
	});
	const [currentRequestId, setCurrentRequestId] = useState<String | undefined>();

	const communicator = useAppCommunicator(iframeRef, safeAppFromManifest, {
		onGetSafeInfo: useGetSafeInfo(),
		onGetSafeBalances: null,
		onGetChainInfo: () => {
			// if (!chain) return;

			// const { nativeCurrency, chainName, chainId, shortName, blockExplorerUriTemplate } = chain;

			return {
				chainName: 'polygon',
				chainId: '0x89',
				shortName: 'polygon',
				nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18, logoUri: 'string' },
				blockExplorerUriTemplate: null
			};
		},
		onSetSafeSettings: (safeSettings: SafeSettings) => {
			const newSettings: SafeSettings = {
				offChainSigning: true
			};

			setSettings(newSettings);

			return newSettings;
		},
		onGetOffChainSignature: null,
		onConfirmTransactions(txs: BaseTransaction[], requestId: string, params?: SendTransactionRequestParams): void {
			throw new Error('Function not implemented.');
		},
		onSignMessage(
			message: string | EIP712TypedData,
			requestId: string,
			method: Methods.signMessage | Methods.signTypedMessage,
			sdkVersion: string
		): void {
			throw new Error('Function not implemented.');
		},
		onGetTxBySafeTxHash(transactionId: string): Promise<TransactionDetails> {
			throw new Error('Function not implemented.');
		},
		onGetEnvironmentInfo(): EnvironmentInfo {
			throw new Error('Function not implemented.');
		},
		onRequestAddressBook(origin: string): AddressBookItem[] {
			throw new Error('Function not implemented.');
		}
	});
	// const onAcceptPermissionRequest = (_origin: string, requestId: RequestId) => {
	// 	const permissions = confirmPermissionRequest(PermissionStatus.GRANTED);
	// 	communicator?.send(permissions, requestId as string);
	// };

	// const onRejectPermissionRequest = (requestId?: RequestId) => {
	// 	if (requestId) {
	// 		confirmPermissionRequest(PermissionStatus.DENIED);
	// 		communicator?.send('Permissions were rejected', requestId as string, true);
	// 	} else {
	// 		setPermissionsRequest(undefined);
	// 	}
	// };
	useEffect(() => {
		const unsubscribe = txSubscribe(TxEvent.SAFE_APPS_REQUEST, async ({ safeAppRequestId, safeTxHash }) => {
			if (safeAppRequestId && currentRequestId === safeAppRequestId) {
				trackSafeAppEvent(SAFE_APPS_EVENTS.PROPOSE_TRANSACTION, 'Jumper');
				communicator?.send({ safeTxHash }, safeAppRequestId);
			}
		});

		return unsubscribe;
	}, [communicator, currentRequestId]);

	useEffect(() => {
		const unsubscribe = safeMsgSubscribe(SafeMsgEvent.SIGNATURE_PREPARED, ({ messageHash, requestId, signature }) => {
			if (requestId && currentRequestId === requestId) {
				communicator?.send({ messageHash, signature }, requestId);
			}
		});

		return unsubscribe;
	}, [communicator, currentRequestId]);
	return (
		<div className='h-full'>
			<iframe
				ref={iframeRef}
				className='w-full h-full'
				id={`iframe-${appUrl}`}
				src={appUrl}
				title='Jumper'
			/>
		</div>
	);
};

export default AppFrame;
