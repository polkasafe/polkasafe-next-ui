// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ConfigProvider } from 'antd';
import { ActiveMultisigProvider } from '@next-evm/context/ActiveMultisigContext';
import { DAppContextProvider } from '@next-evm/context/DAppContext';
import { UserDetailsProvider } from '@next-evm/context/UserDetailsContext';
import { ApiContextProvider } from '@next-evm/context/ApiContext';
import { ReactNode } from 'react';
import antdTheme from '@next-evm/styles/antdTheme';
import { AddMultisigProvider } from '@next-evm/context/AddMultisigContext';
import { MultisigAssetsProvider } from '@next-evm/context/MultisigAssetsContext';
import { CurrencyContextProvider } from '@next-evm/context/CurrencyContext';
import { SuperfluidProvider } from '@next-evm/context/SuperfluidContext';
import { PrivyProvider } from '@privy-io/react-auth';
import { CreateOrgStepsProvider } from '@next-evm/context/CreateOrgStepsContext';
import { ActiveOrgProvider } from '@next-evm/context/ActiveOrgContext';
import LayoutWrapper from './components/LayoutWrapper';
// import PolkasafeLogo from '@next-common/assets/icons/polkasafe.svg';

export default function Providers({ children }: { children?: ReactNode }) {
	const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
	return (
		<ConfigProvider theme={antdTheme}>
			{
				(
					<ApiContextProvider>
						<PrivyProvider
							appId={appId}
							config={{
								appearance: {
									accentColor: '#38A1FF',
									logo: '/TreasurEase-logo.svg',
									theme: '#1B2028',
									walletList: ['metamask', 'detected_wallets']
								},
								loginMethods: ['wallet', 'email']
							}}
						>
							<LayoutWrapper>
								<UserDetailsProvider>
									<SuperfluidProvider>
										<ActiveMultisigProvider>
											<AddMultisigProvider>
												<ActiveOrgProvider>
													<MultisigAssetsProvider>
														<CurrencyContextProvider>
															<DAppContextProvider>
																<CreateOrgStepsProvider>{children}</CreateOrgStepsProvider>
															</DAppContextProvider>
														</CurrencyContextProvider>
													</MultisigAssetsProvider>
												</ActiveOrgProvider>
											</AddMultisigProvider>
										</ActiveMultisigProvider>
									</SuperfluidProvider>
								</UserDetailsProvider>
							</LayoutWrapper>
						</PrivyProvider>
					</ApiContextProvider>
				) as React.ReactNode
			}
		</ConfigProvider>
	);
}
