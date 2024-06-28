/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import acalaLogo from '~assets/parachains-logos/acala-logo.png';
import alephzeroLogo from '~assets/parachains-logos/aleph-zero-logo.jpeg';
import assethubLogo from '~assets/parachains-logos/assethub-logo.png';
import astarLogo from '~assets/parachains-logos/astar-logo.png';
import kusamaLogo from '~assets/parachains-logos/kusama-logo.gif';
import moonbeamLogo from '~assets/parachains-logos/moonbeam-logo.png';
import moonriverLogo from '~assets/parachains-logos/moonriver-logo.png';
import polkadotLogo from '~assets/parachains-logos/polkadot-logo.jpg';
import polymeshLogo from '~assets/parachains-logos/polymesh-logo.png';
import westendLogo from '~assets/parachains-logos/westend-logo.png';
import { StaticImageData } from 'next/image';
import rococoLogo from '~assets/parachains-logos/rococo-logo.jpeg';
import phalaLogo from '~assets/parachains-logos/phala-logo.png';
import khalaLogo from '~assets/parachains-logos/khala-logo.png';
import availLogo from '~assets/parachains-logos/avail-logo.png';

export type Network = (typeof networks)[keyof typeof networks];
export type TokenSymbol = (typeof tokenSymbol)[keyof typeof tokenSymbol];

export interface ChainProps {
	blockTime: number;
	logo?: any;
	ss58Format: number;
	tokenDecimals: number;
	tokenSymbol: TokenSymbol;
	chainId: string;
	rpcEndpoint: string;
	existentialDeposit: string;
}

export type ChainPropType = {
	[index: string]: ChainProps;
};

export const networks = {
	ALEPHZERO: 'alephzero',
	ASTAR: 'astar',
	AVAIL: 'avail-goldberg',
	KHALA: 'khala',
	KUSAMA: 'kusama',
	// PASEO: 'paseo',
	PHALA: 'phala',
	POLKADOT: 'polkadot',
	ROCOCO: 'rococo',
	// ROCOCO_ASSETHUB: 'assethub-rococo',
	STATEMINE: 'assethub-kusama',
	STATEMINT: 'assethub-polkadot',
	TURING: 'avail-turing',
	WESTEND: 'westend'
};

export const tokenSymbol = {
	ASTR: 'ASTR',
	AVL: 'AVL',
	AZERO: 'AZERO',
	DOT: 'DOT',
	KSM: 'KSM',
	PHA: 'PHA',
	// PAS: 'PAS',
	ROC: 'ROC',
	T_AVAIL: 'AVAIL',
	WND: 'WND'
};

export const chainProperties: ChainPropType = {
	[networks.POLKADOT]: {
		blockTime: 6000,
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
		existentialDeposit: '1.00',
		logo: polkadotLogo,
		rpcEndpoint: 'wss://rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[networks.KUSAMA]: {
		blockTime: 6000,
		chainId: 'polkadot:b0a8d493285c2df73290dfb7e61f870f',
		existentialDeposit: '0.000333333333',
		logo: kusamaLogo,
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[networks.WESTEND]: {
		blockTime: 6000,
		chainId: 'polkadot:e143f23803ac50e8f6f8e62695d1ce9e',
		existentialDeposit: '0.0100',
		logo: westendLogo,
		rpcEndpoint: 'wss://westend-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.WND
	},
	[networks.ROCOCO]: {
		blockTime: 6000,
		chainId: 'polkadot:6408de7737c59c238890533af25896a2',
		existentialDeposit: '0.000033333333',
		logo: rococoLogo,
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC
	},
	[networks.ASTAR]: {
		blockTime: 12000,
		chainId: 'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b',
		existentialDeposit: '0.000000000001',
		logo: astarLogo,
		rpcEndpoint: 'wss://astar-rpc.dwellir.com/',
		ss58Format: 5,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.ASTR
	},
	[networks.STATEMINT]: {
		blockTime: 6000,
		chainId: 'polkadot:68d56f15f85d3136970ec16946040bc1',
		existentialDeposit: '0.1000',
		logo: assethubLogo,
		rpcEndpoint: 'wss://polkadot-asset-hub-rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[networks.STATEMINE]: {
		blockTime: 6000,
		chainId: 'polkadot:48239ef607d7928874027a43a6768920',
		existentialDeposit: '0.000033333333',
		logo: assethubLogo,
		rpcEndpoint: 'wss://kusama-asset-hub-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[networks.ALEPHZERO]: {
		blockTime: 1000,
		chainId: 'polkadot:70255b4d28de0fc4e1a193d7e175ad1c',
		existentialDeposit: '0.0000000005',
		logo: alephzeroLogo,
		rpcEndpoint: 'wss://ws.azero.dev/',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.AZERO
	},
	[networks.PHALA]: {
		blockTime: 1000,
		chainId: 'polkadot:1bb969d85965e4bb5a651abbedf21a54',
		existentialDeposit: '0.0100',
		logo: phalaLogo,
		rpcEndpoint: 'wss://phala.api.onfinality.io/public-ws/',
		ss58Format: 30,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PHA
	},
	[networks.KHALA]: {
		blockTime: 1000,
		chainId: 'polkadot:d43540ba6d3eb4897c28a77d48cb5b72',
		existentialDeposit: '0.0100',
		logo: khalaLogo,
		rpcEndpoint: 'wss://khala.public.curie.radiumblock.co/ws/',
		ss58Format: 30,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PHA
	},
	[networks.AVAIL]: {
		blockTime: 1000,
		chainId: 'polkadot:6f09966420b2608d1947ccfb0f2a3624',
		existentialDeposit: '0.00001',
		logo: availLogo,
		// rpcEndpoint: 'wss://rpc-testnet.avail.tools/ws',
		rpcEndpoint: 'wss://goldberg-testnet-rpc.avail.tools/ws',
		// rpcEndpoint: 'wss://goldberg.avail.tools/ws',
		ss58Format: 42,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.AVL
	},
	[networks.TURING]: {
		blockTime: 1000,
		chainId: 'polkadot:d3d2f3a3495dc597434a99d7d449ebad',
		existentialDeposit: '0.00001',
		logo: availLogo,
		rpcEndpoint: 'wss://turing-rpc.avail.so/ws',
		ss58Format: 42,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.T_AVAIL
	}
	// [networks.ROCOCO_ASSETHUB]: {
	// blockTime: 6000,
	// chainId: 'polkadot:7c34d42fc815d392057c78b49f2755c75',
	// existentialDeposit: '0.000033333333',
	// logo: rococoLogo,
	// rpcEndpoint: 'wss://asset-hub-rococo-rpc.dwellir.com',
	// ss58Format: 42,
	// tokenDecimals: 12,
	// tokenSymbol: tokenSymbol.ROC
	// }
	// [networks.PASEO]: {
	// blockTime: 1000,
	// chainId: 0,
	// existentialDeposit: '1.0000',
	// logo: paseoLogo,
	// rpcEndpoint: 'wss://rpc.dotters.network/paseo/',
	// ss58Format: 42,
	// tokenDecimals: 10,
	// tokenSymbol: tokenSymbol.PAS
	// }
};

/* eslint-disable sort-keys */
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
	},
	[onrampTokens.ASTAR]: {
		tokenSymbol: 'astr',
		logo: astarLogo
	},
	[onrampTokens.MOONBEAM]: {
		tokenSymbol: 'glmr',
		logo: moonbeamLogo,
		offramp: true
	},
	[onrampTokens.MOONRIVER]: {
		tokenSymbol: 'movr',
		logo: moonriverLogo
	},
	[onrampTokens.POLYMESH]: {
		tokenSymbol: 'polyx',
		logo: polymeshLogo
	},
	[onrampTokens.ACALA]: {
		tokenSymbol: 'aca',
		logo: acalaLogo
	}
};

export const crossChainNetwork = {
	[networks.ASTAR]: {
		name: 'astar',
		supportedNetworks: ['acala', 'moonbeam', 'parallel', 'phala', 'assethub-polkadot']
	},
	// [networks.AVAIL]: {
	// name: 'avail-goldberg',
	// supportedNetworks: [
	// 'goldberg' // Avail-specific parachain
	// ]
	// },
	[networks.KHALA]: {
		name: 'khala',
		supportedNetworks: ['karura', 'moonriver', 'bifrost', 'parallel-heiko']
	},
	[networks.KUSAMA]: {
		name: 'kusama',
		supportedNetworks: [
			'karura',
			'moonriver',
			'bifrost',
			'parallel-heiko',
			'shiden',
			'assethub-kusama',
			'kilt-spiritnet',
			'crust-shadow',
			'calamari',
			'khala'
		]
	},
	[networks.PHALA]: {
		name: 'phala',
		supportedNetworks: ['khala']
	},
	[networks.POLKADOT]: {
		name: 'polkadot',
		supportedNetworks: ['acala', 'moonbeam', 'astar', 'parallel', 'clover', 'litentry', 'phala', 'assethub-polkadot']
	},
	[networks.ROCOCO]: {
		name: 'rococo',
		supportedNetworks: [
			'basilisk' // Rococo is a testnet for Polkadot and Kusama parachains
		]
	},
	// [networks.ROCOCO_ASSETHUB]: {
	// name: 'rococo',
	// supportedNetworks: ['rococo']
	// },
	[networks.STATEMINE]: {
		name: 'assethub-kusama',
		supportedNetworks: ['karura', 'moonriver', 'shiden', 'bifrost', 'parallel-heiko', 'calamari', 'kilt-spiritnet']
	},
	[networks.STATEMINT]: {
		name: 'assethub-polkadot',
		supportedNetworks: ['acala', 'moonbeam', 'astar', 'parallel', 'clover', 'litentry', 'phala', 'polkadot']
	},
	[networks.TURING]: {
		name: 'avail-turing',
		supportedNetworks: []
	},
	[networks.WESTEND]: {
		name: 'westend',
		supportedNetworks: []
	}
};

export const networkMappingObject = {
	'assethub-polkadot': 'AssetHubPolkadot',
	acala: 'Acala',
	astar: 'Astar',
	'bifrost-polkadot': 'BifrostPolkadot',
	bitgreen: 'Bitgreen',
	centrifuge: 'Centrifuge',
	'composable-finance': 'ComposableFinance',
	darwinia: 'Darwinia',
	'hydra-dx': 'HydraDX',
	interlay: 'Interlay',
	litentry: 'Litentry',
	moonbeam: 'Moonbeam',
	parallel: 'Parallel',
	'assethub-kusama': 'AssetHubKusama',
	'coretime-kusama': 'CoretimeKusama',
	encointer: 'Encointer',
	altair: 'Altair',
	amplitude: 'Amplitude',
	bajun: 'Bajun',
	basilisk: 'Basilisk',
	'bifrost-kusama': 'BifrostKusama',
	pioneer: 'Pioneer',
	calamari: 'Calamari',
	'crust-shadow': 'CrustShadow',
	crab: 'Crab',
	imbue: 'Imbue',
	integritee: 'Integritee',
	'invarch-tinker': 'InvArchTinker',
	karura: 'Karura',
	kintsugi: 'Kintsugi',
	litmus: 'Litmus',
	mangata: 'Mangata',
	moonriver: 'Moonriver',
	'parallel-heiko': 'ParallelHeiko',
	picasso: 'Picasso',
	quartz: 'Quartz',
	robonomics: 'Robonomics',
	shiden: 'Shiden',
	turing: 'Turing',
	unique: 'Unique',
	crust: 'Crust',
	manta: 'Manta',
	nodle: 'Nodle',
	'neuro-web': 'NeuroWeb',
	pendulum: 'Pendulum',
	polkadex: 'Polkadex',
	zeitgeist: 'Zeitgeist',
	collectives: 'Collectives',
	khala: 'Khala',
	phala: 'Phala',
	subsocial: 'Subsocial',
	'kilt-spiritnet': 'KiltSpiritnet',
	curio: 'Curio',
	polkadot: 'Polkadot',
	kusama: 'Kusama'
};
