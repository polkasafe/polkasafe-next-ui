// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChainNamespaceType, CHAIN_NAMESPACES } from '@web3auth/base';
import astarLogo from '@next-common/assets/astar-logo.png';
import ethereumLogo from '@next-common/assets/eth-logo.png';
import arbLogo from '@next-common/assets/parachains-logos/arbitrum-logo.png';
import bnbLogo from '@next-common/assets/parachains-logos/bnb-logo.png';
import gnosisChainLogo from '@next-common/assets/parachains-logos/gnosis-chain-logo.png';
import opLogo from '@next-common/assets/parachains-logos/optimism-logo.png';
// import moonbeamLogo from '@next-common/assets/parachains-logos/moonbeam-logo.png';
import polygonLogo from '@next-common/assets/polygon.png';
import { StaticImageData } from 'next/image';

export type ChainPropType = {
	[network: string]: {
		blockExplorer: string;
		chainId: number;
		chainNamespace: ChainNamespaceType;
		decimals: number;
		displayName: string;
		rpcEndpoint: string;
		tokenSymbol: string;
		tokenName: string;
		logo: StaticImageData;
	};
};

export enum NETWORK {
	// MOONBEAM = 'moonbeam'
	GOERLI = 'goerli',
	POLYGON = 'polygon',
	ASTAR = 'astar',
	ETHEREUM = 'ethereum',
	BNB = 'bnb smart chain',
	ARBITRUM = 'arbitrum',
	OPTIMISM = 'optimism',
	GNOSIS = 'gnosis chain',
	Energy_Web_Chain = 'energy web chain',
	AURORA = 'aurora',
	Avalanche = 'avalanche',
	RINKEBY = 'rinkeby',
	VOLTA = 'volta'
}

export const tokenSymbol = {
	ASTR: 'ASTR',
	BNB: 'BNB',
	ETH: 'ETH',
	GLMR: 'GLMR',
	MATIC: 'MATIC',
	OP: 'OP',
	xDAI: 'xDAI',
	EWT: 'EWT',
	AETH: 'AETH',
	AVAX: 'AVAX',
	OETH: 'OETH',
	GOR: 'GOR',
	VT: 'VT'
};

export const chainProperties: ChainPropType = {
	[NETWORK.GOERLI]: {
		blockExplorer: 'https://goerli.etherscan.io',
		chainId: 5,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Goerli',
		logo: ethereumLogo,
		rpcEndpoint: 'https://goerli.blockpi.network/v1/rpc/public',
		tokenName: 'GoerliETH',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.POLYGON]: {
		blockExplorer: 'https://polygonscan.com/',
		chainId: 137,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Polygon',
		logo: polygonLogo,
		rpcEndpoint: 'https://polygon-rpc.com/',
		tokenName: 'Matic',
		tokenSymbol: tokenSymbol.MATIC
	},
	[NETWORK.ASTAR]: {
		blockExplorer: 'https://astar.subscan.io',
		chainId: 592,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Astar',
		logo: astarLogo,
		rpcEndpoint: 'https://evm.astar.network/',
		tokenName: 'Astar',
		tokenSymbol: tokenSymbol.ASTR
	},
	[NETWORK.ETHEREUM]: {
		blockExplorer: 'https://etherscan.io/',
		chainId: 1,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Ethereum',
		logo: ethereumLogo,
		rpcEndpoint: 'https://eth.api.onfinality.io/public',
		tokenName: 'Ethereum',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.BNB]: {
		blockExplorer: 'https://bscscan.com/',
		chainId: 56,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'BNB Smart Chain',
		logo: bnbLogo,
		rpcEndpoint: 'https://bsc-dataseed.binance.org/',
		tokenName: 'BNB Smart Chain',
		tokenSymbol: tokenSymbol.BNB
	},
	[NETWORK.ARBITRUM]: {
		blockExplorer: 'https://arbiscan.io/',
		chainId: 42161,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Arbitrum',
		logo: arbLogo,
		rpcEndpoint: 'https://arb1.arbitrum.io/rpc',
		tokenName: 'Arbitrum',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.OPTIMISM]: {
		blockExplorer: 'https://optimistic.etherscan.io/',
		chainId: 10,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Optimism',
		logo: opLogo,
		rpcEndpoint: 'https://mainnet.optimism.io/',
		tokenName: 'Optimism',
		tokenSymbol: tokenSymbol.OP
	},
	[NETWORK.GNOSIS]: {
		blockExplorer: 'https://gnosisscan.io/',
		chainId: 100,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Gnosis Chain',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://rpc.gnosischain.com/',
		tokenName: 'Gnosis Chain',
		tokenSymbol: tokenSymbol.xDAI
	},
	[NETWORK.Energy_Web_Chain]: {
		blockExplorer: 'https://explorer.energyweb.org',
		chainId: 246,
		chainNamespace: CHAIN_NAMESPACES.OTHER,
		decimals: 18,
		displayName: 'Energy Web Chain',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://rpc.energyweb.org',
		tokenName: 'Energy Web Token',
		tokenSymbol: tokenSymbol.EWT
	},
	[NETWORK.AURORA]: {
		blockExplorer: 'https://explorer.energyweb.org',
		chainId: 1313161554,
		chainNamespace: CHAIN_NAMESPACES.OTHER,
		decimals: 18,
		displayName: 'Aurora',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://explorer.mainnet.aurora.dev',
		tokenName: 'Ether',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.Avalanche]: {
		blockExplorer: 'https://snowtrace.io',
		chainId: 43114,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Avalanche',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://api.avax.network/ext/bc/C/rpc',
		tokenName: 'Avalanche',
		tokenSymbol: tokenSymbol.AVAX
	},
	[NETWORK.RINKEBY]: {
		blockExplorer: 'https://rinkeby.etherscan.io/',
		chainId: 4,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Rinkeby',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://rinkeby.infura.io/v3/',
		tokenName: 'Rinkeby',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.VOLTA]: {
		blockExplorer: 'https://volta-explorer.energyweb.org/',
		chainId: 73799,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Volta',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://volta-rpc.energyweb.org/',
		tokenName: 'Volta',
		tokenSymbol: tokenSymbol.VT
	}
};
