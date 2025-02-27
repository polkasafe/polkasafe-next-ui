// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@common/enum/substrate';

export const onrampTokens = {
	POLKADOT: 'polkadot',
	KUSAMA: 'kusama',
	ASTAR: 'astar',
	MOONBEAM: 'moonbeam',
	MOONRIVER: 'moonriver',
	POLYMESH: 'polymesh',
	ACALA: 'acala'
};

export const onrampTokenProperties: {
	[name: string]: { tokenSymbol: string; offramp?: boolean };
} = {
	[onrampTokens.POLKADOT]: {
		tokenSymbol: 'dot',
		offramp: true
	},
	[onrampTokens.KUSAMA]: {
		tokenSymbol: 'ksm',
		offramp: true
	},
	[onrampTokens.ASTAR]: {
		tokenSymbol: 'astr'
	},
	[onrampTokens.MOONBEAM]: {
		tokenSymbol: 'glmr',
		offramp: true
	},
	[onrampTokens.MOONRIVER]: {
		tokenSymbol: 'movr'
	},
	[onrampTokens.POLYMESH]: {
		tokenSymbol: 'polyx'
	},
	[onrampTokens.ACALA]: {
		tokenSymbol: 'aca'
	}
};

export const networkConstants = {
	[ENetwork.AVAIL]: {
		disabled: false,
		key: ENetwork.AVAIL,
		name: 'Avail',
		blockTime: 12000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'AVAIL',
		blockExplorerUrl: 'https://avail.subscan.io/',
		rpcEndpoint: 'wss://zeref-api.slowops.xyz/ws',
		chainId: 'polkadot:b91746b45e0346cc2f815a520b9c6cb4'
	},
	[ENetwork.ALEPHZERO]: {
		disabled: false,
		key: ENetwork.ALEPHZERO,
		name: 'Aleph Zero',
		blockTime: 1000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'AZERO',
		blockExplorerUrl: 'https://alephzero.subscan.io/',
		rpcEndpoint: 'wss://ws.azero.dev/',
		chainId: 'polkadot:70255b4d28de0fc4e1a193d7e175ad1c'
	},
	[ENetwork.ASTAR]: {
		disabled: false,
		key: ENetwork.ASTAR,
		name: 'Astar',
		blockTime: 12000,
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'ASTR',
		blockExplorerUrl: 'https://astar.subscan.io/',
		rpcEndpoint: 'wss://astar-rpc.dwellir.com/',
		chainId: 'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b'
	},
	[ENetwork.KHALA]: {
		disabled: false,
		key: ENetwork.KHALA,
		name: 'Khala',
		blockTime: 1000,
		ss58Format: 30,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'PHA',
		blockExplorerUrl: 'https://khala.subscan.io/',
		rpcEndpoint: 'wss://khala.public.curie.radiumblock.co/ws/',
		chainId: 'polkadot:d43540ba6d3eb4897c28a77d48cb5b72'
	},
	[ENetwork.KUSAMA]: {
		disabled: false,
		key: ENetwork.KUSAMA,
		name: 'Kusama',
		blockTime: 6000,
		ss58Format: 2,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
		blockExplorerUrl: 'https://kusama.subscan.io/',
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		chainId: 'polkadot:b0a8d493285c2df73290dfb7e61f870f'
	},
	[ENetwork.PHALA]: {
		disabled: false,
		key: ENetwork.PHALA,
		name: 'Phala',
		blockTime: 1000,
		ss58Format: 30,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'PHA',
		blockExplorerUrl: 'https://phala.subscan.io/',
		rpcEndpoint: 'wss://phala.api.onfinality.io/public-ws/',
		chainId: 'polkadot:1bb969d85965e4bb5a651abbedf21a54'
	},
	[ENetwork.POLKADOT]: {
		disabled: false,
		key: ENetwork.POLKADOT,
		name: 'Polkadot',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://polkadot.subscan.io/',
		rpcEndpoint: 'wss://rpc.polkadot.io',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
	},
	[ENetwork.ROCOCO]: {
		disabled: false,
		key: ENetwork.ROCOCO,
		name: 'Rococo',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'ROC',
		blockExplorerUrl: 'https://rococo.subscan.io/',
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		chainId: 'polkadot:6408de7737c59c238890533af25896a2'
	},
	[ENetwork.ROCOCO_ASSETHUB]: {
		disabled: false,
		key: ENetwork.ROCOCO_ASSETHUB,
		name: 'Rococo Asset Hub',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'ROC',
		blockExplorerUrl: 'https://assethub-rococo.subscan.io/',
		rpcEndpoint: 'wss://rococo-asset-hub-rpc.polkadot.io',
		chainId: 'polkadot:7c34d42fc815d392057c78b49f2755c75'
	},
	[ENetwork.KUSAMA_ASSETHUB]: {
		disabled: false,
		key: ENetwork.KUSAMA_ASSETHUB,
		name: 'Kusama Asset Hub',
		blockTime: 6000,
		ss58Format: 2,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
		blockExplorerUrl: 'https://kusama-asset-hub.subscan.io/',
		rpcEndpoint: 'wss://kusama-asset-hub-rpc.polkadot.io',
		chainId: 'polkadot:48239ef607d7928874027a43a6768920'
	},
	[ENetwork.POLKADOT_ASSETHUB]: {
		disabled: false,
		key: ENetwork.POLKADOT_ASSETHUB,
		name: 'Polkadot Asset Hub',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://polkadot-asset-hub.subscan.io/',
		rpcEndpoint: 'wss://polkadot-asset-hub-rpc.polkadot.io',
		chainId: 'polkadot:68d56f15f85d3136970ec16946040bc1'
	},
	[ENetwork.WESTEND]: {
		disabled: false,
		key: ENetwork.WESTEND,
		name: 'Westend',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'WND',
		blockExplorerUrl: 'https://westend.subscan.io/',
		rpcEndpoint: 'wss://westend-rpc.polkadot.io',
		chainId: 'polkadot:e143f23803ac50e8f6f8e62695d1ce9e'
	},
	[ENetwork.PEOPLE]: {
		disabled: false,
		key: ENetwork.PEOPLE,
		name: 'People',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://people-polkadot.subscan.io/',
		rpcEndpoint: 'wss://polkadot-people-rpc.polkadot.io',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
	},
	[ENetwork.CENTRIFUGE]: {
		disabled: false,
		key: ENetwork.CENTRIFUGE,
		name: 'Centrifuge',
		blockTime: 15000,
		ss58Format: 36,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'CFG',
		blockExplorerUrl: 'https://centrifuge.subscan.io/',
		rpcEndpoint: 'wss://centrifuge-rpc.dwellir.com',
		chainId: 'polkadot:2031',
		supportedTokens: []
	}
};
