/* eslint-disable @typescript-eslint/naming-convention */
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import astarLogo from '@next-common/assets/astar-logo.png';
import ethereumLogo from '@next-common/assets/eth-logo.png';
import arbLogo from '@next-common/assets/parachains-logos/arbitrum-logo.png';
import bnbLogo from '@next-common/assets/parachains-logos/bnb-logo.png';
import gnosisChainLogo from '@next-common/assets/parachains-logos/gnosis-chain-logo.png';
import opLogo from '@next-common/assets/parachains-logos/optimism-logo.png';
import zetachainlogo from '@next-common/assets/parachains-logos/zetachain-logo.jpeg';
// import moonbeamLogo from '@next-common/assets/parachains-logos/moonbeam-logo.png';
import polygonLogo from '@next-common/assets/polygon.png';
import { StaticImageData } from 'next/image';

export type ChainPropType = {
	[network: string]: {
		blockExplorer: string;
		chainId: number;
		decimals: number;
		displayName: string;
		rpcEndpoint: string;
		tokenSymbol: string;
		tokenName: string;
		tokenAddress?: string;
		logo: StaticImageData;
		contractNetworks?: any;
		coingeckoId?: string;
		coingeckoNativeTokenId?: string;
		nativeSuperTokenAddress?: string;
		covalentNetworkName?: string;
	};
};

export enum NETWORK {
	ETHEREUM = 'ethereum',
	POLYGON = 'polygon',
	GNOSIS = 'gnosis chain',
	BNB = 'bnb smart chain',
	GOERLI = 'goerli',
	ASTAR = 'astar',
	// MOONBEAM = 'moonbeam'
	ARBITRUM = 'arbitrum',
	OPTIMISM = 'optimism',
	ZETA_CHAIN = 'ZetaChain Athens-3 Testnet'
}
export const tokenSymbol = {
	ASTR: 'ASTR',
	AZETA: 'AZETA',
	BNB: 'BNB',
	ETH: 'ETH',
	GLMR: 'GLMR',
	MATIC: 'MATIC',
	OP: 'OP',
	xDAI: 'xDAI'
};

export const chainProperties: ChainPropType = {
	[NETWORK.GOERLI]: {
		blockExplorer: 'https://goerli.etherscan.io',
		chainId: 5,
		covalentNetworkName: 'linea-testnet',
		decimals: 18,
		displayName: 'Goerli',
		logo: ethereumLogo,
		nativeSuperTokenAddress: '0x5943f705abb6834cad767e6e4bb258bc48d9c947',
		rpcEndpoint: 'https://goerli.blockpi.network/v1/rpc/public',
		tokenName: 'GoerliETH',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.POLYGON]: {
		blockExplorer: 'https://polygonscan.com',
		chainId: 137,
		coingeckoId: 'polygon-pos',
		coingeckoNativeTokenId: 'matic-network',
		covalentNetworkName: 'matic-mainnet',
		decimals: 18,
		displayName: 'Polygon',
		logo: polygonLogo,
		nativeSuperTokenAddress: '0x3aD736904E9e65189c3000c7DD2c8AC8bB7cD4e3',
		rpcEndpoint: 'https://polygon-rpc.com/',
		tokenAddress: '0x0000000000000000000000000000000000001010',
		tokenName: 'Matic',
		tokenSymbol: tokenSymbol.MATIC
	},
	[NETWORK.ASTAR]: {
		blockExplorer: 'https://astar.subscan.io',
		chainId: 592,
		coingeckoId: 'astar',
		covalentNetworkName: 'astar-mainnet',
		decimals: 18,
		displayName: 'Astar',
		logo: astarLogo,
		rpcEndpoint: 'https://evm.astar.network/',
		tokenName: 'Astar',
		tokenSymbol: tokenSymbol.ASTR
	},
	[NETWORK.ETHEREUM]: {
		blockExplorer: 'https://etherscan.io',
		chainId: 1,
		coingeckoId: 'ethereum',
		coingeckoNativeTokenId: 'ethereum',
		covalentNetworkName: 'eth-mainnet',
		decimals: 18,
		displayName: 'Ethereum',
		logo: ethereumLogo,
		nativeSuperTokenAddress: '0xc22bea0be9872d8b7b3933cec70ece4d53a900da',
		rpcEndpoint: 'https://eth.api.onfinality.io/public',
		tokenName: 'Ethereum',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.BNB]: {
		blockExplorer: 'https://bscscan.com',
		chainId: 56,
		coingeckoId: 'binance-smart-chain',
		covalentNetworkName: 'bsc-mainnet',
		decimals: 18,
		displayName: 'BNB Smart Chain',
		logo: bnbLogo,
		nativeSuperTokenAddress: '0x529a4116f160c833c61311569d6b33dff41fd657',
		rpcEndpoint: 'https://bsc-dataseed.binance.org/',
		tokenName: 'BNB Smart Chain',
		tokenSymbol: tokenSymbol.BNB
	},
	[NETWORK.ARBITRUM]: {
		blockExplorer: 'https://arbiscan.io',
		chainId: 42161,
		coingeckoId: 'arbitrum-one',
		covalentNetworkName: 'arbitrum-mainnet',
		decimals: 18,
		displayName: 'Arbitrum',
		logo: arbLogo,
		nativeSuperTokenAddress: '0xe6c8d111337d0052b9d88bf5d7d55b7f8385acd3',
		rpcEndpoint: 'https://arb1.arbitrum.io/rpc',
		tokenName: 'Arbitrum',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.OPTIMISM]: {
		blockExplorer: 'https://optimistic.etherscan.io',
		chainId: 10,
		coingeckoId: 'optimistic-ethereum',
		covalentNetworkName: 'optimism-mainnet',
		decimals: 18,
		displayName: 'Optimism',
		logo: opLogo,
		nativeSuperTokenAddress: '0x1828bff08bd244f7990eddcd9b19cc654b33cdb4',
		rpcEndpoint: 'https://mainnet.optimism.io/',
		tokenName: 'Optimism',
		tokenSymbol: tokenSymbol.OP
	},
	[NETWORK.GNOSIS]: {
		blockExplorer: 'https://gnosisscan.io',
		chainId: 100,
		coingeckoId: 'xdai',
		decimals: 18,
		displayName: 'Gnosis Chain',
		logo: gnosisChainLogo,
		nativeSuperTokenAddress: '0x59988e47a3503aafaa0368b9def095c818fdca01',
		rpcEndpoint: 'https://rpc.gnosischain.com/',
		tokenName: 'Gnosis Chain',
		tokenSymbol: tokenSymbol.xDAI
	},
	[NETWORK.ZETA_CHAIN]: {
		blockExplorer: 'https://explorer.zetachain.com',
		chainId: 7001,
		contractNetworks: {
			'7001': {
				createCallAddress: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
				fallbackHandlerAddress: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
				multiSendAddress: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
				multiSendCallOnlyAddress: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
				safeMasterCopyAddress: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
				safeProxyFactoryAddress: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
				signMessageLibAddress: '0x98FFBBF51bb33A056B08ddf711f289936AafF717',
				simulateTxAccessorAddress: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
			}
		},
		decimals: 18,
		displayName: 'ZetaChain Testnet',
		logo: zetachainlogo,
		rpcEndpoint: 'https://rpc.ankr.com/zetachain_evm_athens_testnet',
		tokenName: 'ZetaChain Testnet',
		tokenSymbol: tokenSymbol.AZETA
	}
	// [NETWORK.MOONBEAM]: {
	// blockExplorer: 'https://moonbeam-explorer.netlify.app/?network=Moonbeam',
	// chainId: '0x504',
	// chainNamespace: CHAIN_NAMESPACES.OTHER,
	// decimals: 18,
	// displayName: 'Moonbeam',
	// logo: moonbeamLogo,
	// rpcEndpoint: 'wss://wss.api.moonbeam.network',
	// tokenName: 'Moonbeam',
	// tokenSymbol: tokenSymbol.GLMR
	// }
};
