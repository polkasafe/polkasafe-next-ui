// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable no-tabs */

'use client';

import { chainProperties, networks } from '@next-common/global/networkConstants';
import Client from '@walletconnect/sign-client';
import UniversalProvider from '@walletconnect/universal-provider';
import { PairingTypes, SessionTypes } from '@walletconnect/types';
import { WalletConnectModal } from '@walletconnect/modal';
import { createContext, useContext, useMemo, ReactNode, useCallback, useState, useEffect } from 'react';

export const DEFAULT_APP_METADATA = {
	name: 'Polkasafe',
	description: 'Polkasafe Multisig',
	url: 'app.polkasafe.xyz',
	icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export interface IWalletConnectContext {
	client: Client | undefined;
	session: SessionTypes.Struct | undefined;
	connect: (pairing?: { topic: string }) => Promise<string[]>;
	disconnect: () => Promise<void>;
	pairings: PairingTypes.Struct[];
}

export const initialAddMultisigContext: IWalletConnectContext = {} as IWalletConnectContext;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

const web3Modal = new WalletConnectModal({
	projectId: '681a25a9988434e34c628b3be43781b8',
	themeMode: 'dark'
});

export const WalletConnectContext = createContext(initialAddMultisigContext);

export function useWalletConnectContext() {
	return useContext(WalletConnectContext);
}

export const WalletConnectProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [client, setClient] = useState<Client>();
	const [pairings, setPairings] = useState<PairingTypes.Struct[]>([]);
	const [session, setSession] = useState<SessionTypes.Struct>();

	const connect = useCallback(
		async (pairing: any) => {
			if (typeof client === 'undefined') {
				// eslint-disable-next-line sonarjs/no-duplicate-string
				throw new Error('WalletConnect is not initialized');
			}
			console.log('connect, pairing topic is:', pairing?.topic);
			try {
				// const requiredNamespaces = getRequiredNamespaces(chains);
				// console.log('requiredNamespaces config for connect:', requiredNamespaces);
				// const optionalNamespaces = getOptionalNamespaces(chains);
				// console.log('optionalNamespaces config for connect:', optionalNamespaces);
				const { uri, approval } = await client.connect({
					pairingTopic: pairing?.topic,
					requiredNamespaces: {
						polkadot: {
							chains: Object.values(networks).map((n) => chainProperties[n].chainId),
							events: [],
							methods: ['polkadot_signTransaction', 'polkadot_signMessage']
						}
					}
				});

				// Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
				if (uri) {
					// Create a flat array of all requested chains across namespaces.
					// const standaloneChains = Object.values(requiredNamespaces)
					// 	.map((namespace) => namespace.chains)
					// 	.flat() as string[];

					web3Modal.openModal({ uri });
				}

				const s = await approval();
				console.log('Established session:', s);
				setSession(s);
				// Update known pairings after session is connected.
				setPairings(client.pairing.getAll({ active: true }));
				return s.namespaces.polkadot.accounts
					.filter((item) => item.split(':')[1] === chainProperties[networks.POLKADOT].chainId.split(':')[1])
					.map((item) => item.split(':')[2]);
			} catch (e) {
				console.error(e);
				// toast.error((e as Error).message, {
				// 	position: 'bottom-left'
				// });
				throw e;
			} finally {
				// close modal in case it was open
				web3Modal.closeModal();
			}
		},
		[client]
	);

	const subscribeToEvents = useCallback(async (_client: Client) => {
		if (typeof _client === 'undefined') {
			throw new Error('WalletConnect is not initialized');
		}

		_client.on('session_ping', (args) => {
			console.log('EVENT', 'session_ping', args);
		});

		_client.on('session_event', (args) => {
			console.log('EVENT', 'session_event', args);
		});

		_client.on('session_update', ({ topic, params }) => {
			console.log('EVENT', 'session_update', { topic, params });
			const { namespaces } = params;
			const newSession = _client.session.get(topic);
			const updatedSession = { ...newSession, namespaces };
			setSession(updatedSession);
		});

		_client.on('session_delete', () => {
			console.log('EVENT', 'session_delete');
			setSession(undefined);
		});
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const checkPersistedState = useCallback(
		async (_client: Client) => {
			if (typeof _client === 'undefined') {
				throw new Error('WalletConnect is not initialized');
			}
			// populates existing pairings to state
			setPairings(_client.pairing.getAll({ active: true }));
			console.log('RESTORED PAIRINGS: ', _client.pairing.getAll({ active: true }));

			if (typeof session !== 'undefined') return;
			// populates (the last) existing session to state
			if (_client.session.length) {
				const lastKeyIndex = _client.session.keys.length - 1;
				const prevSessioin = _client.session.get(_client.session.keys[lastKeyIndex]);
				console.log('RESTORED SESSION:', prevSessioin);
				setSession(prevSessioin);
			}
		},
		[session]
	);

	const createClient = useCallback(async () => {
		try {
			// setIsInitializing(true);
			// const claimedOrigin = localStorage.getItem('wallet_connect_dapp_origin') || origin;
			console.log('before client init');

			const provider = await UniversalProvider.init({
				relayUrl: 'wss://relay.walletconnect.com',
				projectId: '681a25a9988434e34c628b3be43781b8'
			});
			// const _client = await Client.init({
			// 	logger: 'debug',
			// 	relayUrl: 'wss://relay.walletconnect.com',
			// 	projectId: '681a25a9988434e34c628b3be43781b8'
			// 	// metadata: DEFAULT_APP_METADATA
			// });
			console.log('wallet connect client', provider.client as Client);

			setClient(provider.client as Client);
			// setOrigin(_client.metadata.url);
			// prevRelayerValue.current = relayerRegion;
			await subscribeToEvents(provider.client);
			// await checkPersistedState(_client);
			// await _logClientId(_client);
		} catch (error) {
			console.log('error in initialising wc client', error);
		} finally {
			// setIsInitializing(false);
		}
	}, [subscribeToEvents]);

	useEffect(() => {
		if (!client) {
			createClient();
		}
	}, [client, createClient]);

	const value = useMemo(
		() => ({
			client,
			connect,
			session,
			pairings
		}),
		[client, connect, pairings, session]
	);

	return (
		<WalletConnectContext.Provider value={value as IWalletConnectContext}>{children}</WalletConnectContext.Provider>
	);
};
