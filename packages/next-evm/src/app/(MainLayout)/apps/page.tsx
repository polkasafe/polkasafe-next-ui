/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sort-keys */
'use client';
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
import AppFrame from '@next-evm/app/components/AppFrame';
import { useSafeAppFromManifest } from '@next-evm/hooks/useSafeAppFromManifest';
import useGetSafeInfo from '../../../hooks/useGetSafeInfo';

const SafeApps = () => {
	// const appUrl = 'https://jumper.exchange/';
	const appUrl = 'http://localhost:3001/';
	const { safeApp } = useSafeAppFromManifest(appUrl || '', '0x89');
	return (
		<AppFrame
			safeAppFromManifest={safeApp}
			appUrl={appUrl}
		/>
	);
};

export default SafeApps;
