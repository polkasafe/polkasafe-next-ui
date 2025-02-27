// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IConnectedUser } from '@common/types/substrate';
import { atom, useAtom } from 'jotai';

export const userAtom = atom<IConnectedUser | null>(null);

export const useUser = () => useAtom(userAtom);
