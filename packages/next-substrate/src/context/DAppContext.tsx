// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import '@polkadot/api-augment';

import { useContext, useState, createContext, useMemo, Context, ReactNode } from 'react';

export interface DAppContextType {
	iframeVisibility: string | null;
	setIframeVisibility: React.Dispatch<React.SetStateAction<string | null>>;
}

export const DAppContext: Context<DAppContextType> = createContext({} as DAppContextType);

export enum Apps {
	POLKASSEMBLY = 'polkassembly',
	SUB_ID = 'sub_id',
	ASTAR = 'astar'
}

export function DAppContextProvider({ children }: { children?: ReactNode }): ReactNode {
	const [iframeVisibility, setIframeVisibility] = useState<string | null>(null);

	const value = useMemo(() => ({ iframeVisibility, setIframeVisibility }), [iframeVisibility]);

	return <DAppContext.Provider value={value}>{children}</DAppContext.Provider>;
}

export function useGlobalDAppContext() {
	return useContext(DAppContext);
}
