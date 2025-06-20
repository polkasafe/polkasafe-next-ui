
import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { root, rootPorcini } from 'viem/chains';

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string;

export const authClient = new FutureverseAuthClient({
  clientId,
  environment: 'production',
  redirectUri: 'https://root.polkasafe.xyz/login',
  signInFlow: 'redirect',
});

export const getWagmiConfig = async () => {
  return createWagmiConfig({
    authClient,
    // Optional if supporting SSR
    ssr: true,
    // Optional chains you wish to support
    chains: [root, rootPorcini],
    // Optional if supporting SSR
    storage: createStorage({
      storage: cookieStorage,
    }),
  });
};