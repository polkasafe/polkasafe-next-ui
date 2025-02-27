// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IWalletConnect } from '@common/types/substrate';
import { atom } from 'jotai';

export const walletConnectAtom = atom<IWalletConnect | null>(null);
