// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ReactNode, createContext, useContext, useMemo, useState } from 'react';

export interface DAppContextType {
	iframeVisibility: Apps | null;
	setIframeVisibility: React.Dispatch<React.SetStateAction<Apps | null>>;
}

export enum Apps {
	POLKASSEMBLY = 'polkassembly',
	SUB_ID = 'sub_id',
	ASTAR = 'astar'
}

export const DAppContext: React.Context<DAppContextType> = createContext({} as DAppContextType);

export function DAppContextProvider({ children }: { children: ReactNode }): ReactNode {
	const [iframeVisibility, setIframeVisibility] = useState<Apps | null>(null);

	const value = useMemo(() => ({ iframeVisibility, setIframeVisibility }), [iframeVisibility]);

	return <DAppContext.Provider value={value}>{children}</DAppContext.Provider>;
}

export function useGlobalDAppContext() {
	return useContext(DAppContext);
}
