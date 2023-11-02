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

export default function Providers({ children }: { children?: ReactNode }) {
	return (
		<ConfigProvider theme={antdTheme}>
			{
				(
					<ApiContextProvider>
						<UserDetailsProvider>
							<ActiveMultisigProvider>
								<AddMultisigProvider>
									<DAppContextProvider>{children}</DAppContextProvider>
								</AddMultisigProvider>
							</ActiveMultisigProvider>
						</UserDetailsProvider>
					</ApiContextProvider>
				) as React.ReactNode
			}
		</ConfigProvider>
	);
}
