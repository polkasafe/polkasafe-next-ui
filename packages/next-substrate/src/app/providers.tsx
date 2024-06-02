// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// eslint-disable-next-line import/no-extraneous-dependencies
import { ConfigProvider } from 'antd';
import { ActiveMultisigProvider } from '@next-substrate/context/ActiveMultisigContext';
import { DAppContextProvider } from '@next-substrate/context/DAppContext';
import { UserDetailsProvider } from '@next-substrate/context/UserDetailsContext';
import { CurrencyContextProvider } from '@next-substrate/context/CurrencyContext';
import { ApiContextProvider } from '@next-substrate/context/ApiContext';
import { ReactNode } from 'react';
import antdTheme from '@next-substrate/styles/antdTheme';
import { AddMultisigProvider } from '@next-substrate/context/AddMultisigContext';
import { ActiveOrgProvider } from '@next-substrate/context/ActiveOrgContext';
import { CreateOrgStepsProvider } from '@next-substrate/context/CreateOrgStepsContext';
import { MultisigAssetsProvider } from '@next-substrate/context/MultisigAssetsContext';
import CacheProvider from '@next-substrate/context/CachedDataContext';
import { WalletConnectProvider } from '@next-substrate/context/WalletConnectProvider';

export default function Providers({ children }: { children?: ReactNode }) {
	return (
		<ConfigProvider theme={antdTheme}>
			{
				(
					<ApiContextProvider>
						<WalletConnectProvider>
							<CurrencyContextProvider>
								<UserDetailsProvider>
									<ActiveMultisigProvider>
										<AddMultisigProvider>
											<ActiveOrgProvider>
												<CacheProvider>
													<MultisigAssetsProvider>
														<DAppContextProvider>
															<CreateOrgStepsProvider>{children}</CreateOrgStepsProvider>
														</DAppContextProvider>
													</MultisigAssetsProvider>
												</CacheProvider>
											</ActiveOrgProvider>
										</AddMultisigProvider>
									</ActiveMultisigProvider>
								</UserDetailsProvider>
							</CurrencyContextProvider>
						</WalletConnectProvider>
					</ApiContextProvider>
				) as React.ReactNode
			}
		</ConfigProvider>
	);
}
