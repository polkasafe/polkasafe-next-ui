'use client';

import {
  FutureverseAuthProvider,
  FutureverseWagmiProvider,
} from '@futureverse/auth-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State } from 'wagmi';
import { AuthUiProvider, DefaultTheme, ThemeConfig } from '@futureverse/auth-ui';
import { authClient, getWagmiConfig } from '../global/lib/auth-config';


const customThemeConfig: ThemeConfig = {
  ...DefaultTheme,
  defaultAuthOption: 'web3',
};

const queryClient = new QueryClient();

export default function QueryProvider({
  children,
  initialWagmiState,
}: {
  children: React.ReactNode;
  initialWagmiState?: State;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <FutureverseWagmiProvider
        getWagmiConfig={getWagmiConfig}
        initialState={initialWagmiState}
      >
        <FutureverseAuthProvider authClient={authClient}>
          <AuthUiProvider authClient={authClient as any} themeConfig={customThemeConfig}>
            {children}
          </AuthUiProvider>
        </FutureverseAuthProvider>
      </FutureverseWagmiProvider>
    </QueryClientProvider>
  );
}