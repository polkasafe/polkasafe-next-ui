// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Astar, Goerli, Polygon } from '@thirdweb-dev/chains';
import { metamaskWallet, ThirdwebProvider, walletConnect } from '@thirdweb-dev/react';
import { ConfigProvider } from 'antd';
import { ActiveMultisigProvider } from '@next-evm/context/ActiveMultisigContext';
import { DAppContextProvider } from '@next-evm/context/DAppContext';
import { UserDetailsProvider } from '@next-evm/context/UserDetailsContext';
import { ApiContextProvider, useGlobalApiContext } from '@next-evm/context/ApiContext';
import { ReactNode } from 'react';
import antdTheme from '@next-evm/styles/antdTheme';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';

const chains: any = {
	astar: Astar,
	goerli: Goerli,
	polygon: Polygon
};

export default function Providers({ children }: { children?: ReactNode }) {
	const { network } = useGlobalApiContext();

	return (
		<ConfigProvider theme={antdTheme}>
			{
				(
					<ApiContextProvider>
						<ThirdwebProvider
							activeChain={chains?.[network] || Astar}
							clientId='b2c09dab179152e7936744fa00899dfa'
							authConfig={{
								domain: FIREBASE_FUNCTIONS_URL as string
							}}
							supportedWallets={[metamaskWallet(), walletConnect()]}
						>
							<UserDetailsProvider>
								<ActiveMultisigProvider>
									<DAppContextProvider>{children}</DAppContextProvider>
								</ActiveMultisigProvider>
							</UserDetailsProvider>
						</ThirdwebProvider>
					</ApiContextProvider>
				) as React.ReactNode
			}
		</ConfigProvider>
	);
}
