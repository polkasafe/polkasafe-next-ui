/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sort-keys */
import React, { useRef, useState } from 'react';
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
