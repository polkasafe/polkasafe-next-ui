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

export default function Providers({ children }: { children?: ReactNode }) {
	return (
		<ConfigProvider theme={antdTheme}>
			{
				(
					<ApiContextProvider>
						<CurrencyContextProvider>
							<UserDetailsProvider>
								<ActiveMultisigProvider>
									<AddMultisigProvider>
										<DAppContextProvider>{children}</DAppContextProvider>
									</AddMultisigProvider>
								</ActiveMultisigProvider>
							</UserDetailsProvider>
						</CurrencyContextProvider>
					</ApiContextProvider>
				) as React.ReactNode
			}
		</ConfigProvider>
	);
}
