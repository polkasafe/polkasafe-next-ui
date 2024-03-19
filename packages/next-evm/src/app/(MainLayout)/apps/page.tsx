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
import { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk';
import React, { useRef, useState } from 'react';
import useGetSafeInfo from './useGetSafeInfo';

const SafeApps = () => {
	const appUrl = 'https://jumper.exchange/';
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [settings, setSettings] = useState<SafeSettings>({
		offChainSigning: true
	});
	const { safeApp, isLoading } = useSafeAppFromManifest(appUrl || '', '0x89');
	const communicator = useAppCommunicator(iframeRef, remoteApp || safeAppFromManifest, chain, {
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
		onConfirmTransactions: function (
			txs: BaseTransaction[],
			requestId: string,
			params?: SendTransactionRequestParams
		): void {
			throw new Error('Function not implemented.');
		},
		onSignMessage: function (
			message: string | EIP712TypedData,
			requestId: string,
			method: Methods.signMessage | Methods.signTypedMessage,
			sdkVersion: string
		): void {
			throw new Error('Function not implemented.');
		},
		onGetTxBySafeTxHash: function (transactionId: string): Promise<TransactionDetails> {
			throw new Error('Function not implemented.');
		},
		onGetEnvironmentInfo: function (): EnvironmentInfo {
			throw new Error('Function not implemented.');
		},
		onRequestAddressBook: function (origin: string): AddressBookItem[] {
			throw new Error('Function not implemented.');
		}
	});
	return (
		<div className='h-full'>
			<iframe
				className='w-full h-full'
				id={`iframe-${appUrl}`}
				src={appUrl}
				title='Jumper'
			/>
		</div>
	);
};

export default SafeApps;
