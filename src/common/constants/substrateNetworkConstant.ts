// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StaticImageData } from 'next/image';
// import acalaLogo from '@common/assets/parachains-logos/acala-logo.png';
import alephzeroLogo from '@common/assets/parachains-logos/aleph-zero-logo.jpeg';
import assethubLogo from '@common/assets/parachains-logos/assethub-logo.png';
import astarLogo from '@common/assets/parachains-logos/astar-logo.png';
import kusamaLogo from '@common/assets/parachains-logos/kusama-logo.gif';
// import moonbeamLogo from '@common/assets/parachains-logos/moonbeam-logo.png';
// import moonriverLogo from '@common/assets/parachains-logos/moonriver-logo.png';
import polkadotLogo from '@common/assets/parachains-logos/polkadot-logo.jpg';
import centrifugeLogo from '@common/assets/parachains-logos/centrifuge-logo.png';
// import polymeshLogo from '@common/assets/parachains-logos/polymesh-logo.png';
import westendLogo from '@common/assets/parachains-logos/westend-logo.png';
import rococoLogo from '@common/assets/parachains-logos/rococo-logo.jpeg';
import phalaLogo from '@common/assets/parachains-logos/phala-logo.png';
import khalaLogo from '@common/assets/parachains-logos/khala-logo.png';
import availLogo from '@common/assets/parachains-logos/avail-logo.png';
import rootscanLogo from '@common/assets/parachains-logos/rootscan-logo.png';
import { ENetwork } from '@common/enum/substrate';

export const onrampTokens = {
	POLKADOT: 'polkadot',
	KUSAMA: 'kusama'
	// ASTAR: 'astar',
	// MOONBEAM: 'moonbeam',
	// MOONRIVER: 'moonriver',
	// POLYMESH: 'polymesh',
	// ACALA: 'acala'
};

export const onrampTokenProperties: {
	[name: string]: { tokenSymbol: string; logo: StaticImageData; offramp?: boolean };
} = {
	[onrampTokens.POLKADOT]: {
		tokenSymbol: 'dot',
		logo: polkadotLogo,
		offramp: true
	},
	[onrampTokens.KUSAMA]: {
		tokenSymbol: 'ksm',
		logo: kusamaLogo,
		offramp: true
	}
	// [onrampTokens.ASTAR]: {
	// tokenSymbol: 'astr',
	// logo: astarLogo
	// },
	// [onrampTokens.MOONBEAM]: {
	// tokenSymbol: 'glmr',
	// logo: moonbeamLogo,
	// offramp: true
	// },
	// [onrampTokens.MOONRIVER]: {
	// tokenSymbol: 'movr',
	// logo: moonriverLogo
	// },
	// [onrampTokens.POLYMESH]: {
	// tokenSymbol: 'polyx',
	// logo: polymeshLogo
	// },
	// [onrampTokens.ACALA]: {
	// tokenSymbol: 'aca',
	// logo: acalaLogo
	// }
};

export const networkConstants = {
	[ENetwork.AVAIL]: {
		disabled: true,
		key: ENetwork.AVAIL,
		name: 'Avail',
		blockTime: 12000,
		logo: availLogo,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'AVAIL',
		blockExplorerUrl: 'https://avail.subscan.io/',
		rpcEndpoint: 'wss://zeref-api.slowops.xyz/ws',
		chainId: 'polkadot:b91746b45e0346cc2f815a520b9c6cb4',
		supportedTokens: []
	},
	[ENetwork.ALEPHZERO]: {
		disabled: true,
		key: ENetwork.ALEPHZERO,
		name: 'Aleph Zero',
		blockTime: 1000,
		logo: alephzeroLogo,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'AZERO',
		blockExplorerUrl: 'https://alephzero.subscan.io/',
		rpcEndpoint: 'wss://ws.azero.dev/',
		chainId: 'polkadot:70255b4d28de0fc4e1a193d7e175ad1c',
		supportedTokens: []
	},
	[ENetwork.ASTAR]: {
		disabled: true,
		key: ENetwork.ASTAR,
		name: 'Astar',
		blockTime: 12000,
		logo: astarLogo,
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'ASTR',
		blockExplorerUrl: 'https://astar.subscan.io/',
		rpcEndpoint: 'wss://astar-rpc.dwellir.com/',
		chainId: 'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b',
		supportedTokens: []
	},
	[ENetwork.KHALA]: {
		disabled: true,
		key: ENetwork.KHALA,
		name: 'Khala',
		blockTime: 1000,
		logo: khalaLogo,
		ss58Format: 30,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'PHA',
		blockExplorerUrl: 'https://khala.subscan.io/',
		rpcEndpoint: 'wss://khala.public.curie.radiumblock.co/ws/',
		chainId: 'polkadot:d43540ba6d3eb4897c28a77d48cb5b72',
		supportedTokens: []
	},
	[ENetwork.KUSAMA]: {
		disabled: true,
		key: ENetwork.KUSAMA,
		name: 'Kusama',
		blockTime: 6000,
		logo: kusamaLogo,
		ss58Format: 2,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
		blockExplorerUrl: 'https://kusama.subscan.io/',
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		chainId: 'polkadot:b0a8d493285c2df73290dfb7e61f870f',
		supportedTokens: []
	},
	[ENetwork.PHALA]: {
		disabled: true,
		key: ENetwork.PHALA,
		name: 'Phala',
		blockTime: 1000,
		logo: phalaLogo,
		ss58Format: 30,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'PHA',
		blockExplorerUrl: 'https://phala.subscan.io/',
		rpcEndpoint: 'wss://phala.api.onfinality.io/public-ws/',
		chainId: 'polkadot:1bb969d85965e4bb5a651abbedf21a54',
		supportedTokens: []
	},
	[ENetwork.POLKADOT]: {
		disabled: true,
		key: ENetwork.POLKADOT,
		name: 'Polkadot',
		blockTime: 6000,
		logo: polkadotLogo,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://polkadot.subscan.io/',
		rpcEndpoint: 'wss://rpc.polkadot.io',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
		supportedTokens: []
	},
	[ENetwork.ROCOCO]: {
		disabled: true,
		key: ENetwork.ROCOCO,
		name: 'Rococo',
		blockTime: 6000,
		logo: rococoLogo,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'ROC',
		blockExplorerUrl: 'https://rococo.subscan.io/',
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		chainId: 'polkadot:6408de7737c59c238890533af25896a2',
		supportedTokens: []
	},
	[ENetwork.ROCOCO_ASSETHUB]: {
		disabled: true,
		key: ENetwork.ROCOCO_ASSETHUB,
		name: 'Rococo Asset Hub',
		blockTime: 6000,
		logo: rococoLogo,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'ROC',
		blockExplorerUrl: 'https://asset-hub-rococo.subscan.io/',
		rpcEndpoint: 'wss://asset-hub-rococo-rpc.dwellir.com',
		chainId: 'polkadot:7c34d42fc815d392057c78b49f2755c75',
		supportedTokens: [
			{
				id: 1997,
				name: 'USDT',
				symbol: 'USDT',
				decimals: 6
			},
			{
				id: 1337,
				name: 'USDC',
				symbol: 'USDC',
				decimals: 6
			}
		]
	},
	[ENetwork.KUSAMA_ASSETHUB]: {
		disabled: true,
		key: ENetwork.KUSAMA_ASSETHUB,
		name: 'Kusama Asset Hub',
		blockTime: 6000,
		logo: assethubLogo,
		ss58Format: 2,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
		blockExplorerUrl: 'https://kusama-asset-hub.subscan.io/',
		rpcEndpoint: 'wss://kusama-asset-hub-rpc.polkadot.io',
		chainId: 'polkadot:48239ef607d7928874027a43a6768920',
		supportedTokens: []
	},
	[ENetwork.POLKADOT_ASSETHUB]: {
		disabled: true,
		key: ENetwork.POLKADOT_ASSETHUB,
		name: 'Polkadot Asset Hub',
		blockTime: 6000,
		logo: assethubLogo,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://polkadot-asset-hub.subscan.io/',
		rpcEndpoint: 'wss://polkadot-asset-hub-rpc.polkadot.io',
		chainId: 'polkadot:68d56f15f85d3136970ec16946040bc1',
		supportedTokens: [
			{
				id: 1984,
				name: 'USDT',
				symbol: 'USDT',
				decimals: 6
			},
			{
				id: 1337,
				name: 'USDC',
				symbol: 'USDC',
				decimals: 6
			}
		]
	},
	[ENetwork.WESTEND]: {
		disabled: true,
		key: ENetwork.WESTEND,
		name: 'Westend',
		blockTime: 6000,
		logo: westendLogo,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'WND',
		blockExplorerUrl: 'https://westend.subscan.io/',
		rpcEndpoint: 'wss://westend-rpc.polkadot.io',
		chainId: 'polkadot:e143f23803ac50e8f6f8e62695d1ce9e',
		supportedTokens: []
	},
	[ENetwork.PEOPLE]: {
		disabled: true,
		key: ENetwork.PEOPLE,
		name: 'People',
		blockTime: 6000,
		logo: polkadotLogo,
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://people-polkadot.subscan.io/',
		rpcEndpoint: 'wss://polkadot-people-rpc.polkadot.io',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
		supportedTokens: []
	},
	[ENetwork.CENTRIFUGE]: {
		disabled: true,
		key: ENetwork.CENTRIFUGE,
		name: 'Centrifuge',
		blockTime: 15000,
		logo: centrifugeLogo,
		ss58Format: 36,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: 'CFG',
		blockExplorerUrl: 'https://centrifuge.subscan.io/',
		rpcEndpoint: 'wss://centrifuge-rpc.dwellir.com',
		chainId: 'polkadot:2031',
		supportedTokens: []
	},
	[ENetwork.ROOT]: {
		disabled: false,
		key: ENetwork.ROOT,
		name: 'Root',
		blockTime: 4000,
		logo: rootscanLogo,
		ss58Format: 193,
		subsquidUrl: '',
		tokenDecimals: 6,
		tokenSymbol: 'ROOT',
		blockExplorerUrl: 'wss://porcini.rootnet.app/ws',
		rpcEndpoint: 'wss://root.rootnet.live/ws',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c251',
		supportedTokens: [
			{
				id: 2,
				name: 'XRP',
				symbol: 'XRP',
				decimals: 6
			}
		]
	},
	[ENetwork.PORCINI]: {
		disabled: false,
		key: ENetwork.PORCINI,
		name: 'Porcini',
		blockTime: 5000,
		logo: rootscanLogo,
		ss58Format: 193,
		subsquidUrl: '',
		tokenDecimals: 6,
		tokenSymbol: 'ROOT',
		blockExplorerUrl: 'https://porcini.rootscan.io/',
		rpcEndpoint: 'wss://porcini.rootnet.app/archive/ws',
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c251',
		supportedTokens: [
			{
				id: 2,
				name: 'XRP',
				symbol: 'XRP',
				decimals: 6
			}
		]
	}
};
