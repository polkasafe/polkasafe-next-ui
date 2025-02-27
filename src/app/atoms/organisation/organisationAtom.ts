// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IOrganisation } from '@common/types/substrate';
import { atom, useAtom } from 'jotai';

export const organisationAtom = atom<IOrganisation | null>(null);

export const useOrganisation = () => useAtom(organisationAtom);
