// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IDashboardTransaction } from '@common/types/substrate';
import { atom, useAtom } from 'jotai';

interface ITransactionAtom {
	transactions: Array<IDashboardTransaction>;
	currentIndex: number;
}

export const queueTransactionAtom = atom<ITransactionAtom | null>(null);
export const historyTransactionAtom = atom<ITransactionAtom | null>(null);

export const useQueueAtom = () => useAtom(queueTransactionAtom);
export const useHistoryAtom = () => useAtom(historyTransactionAtom);
