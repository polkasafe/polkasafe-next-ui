// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { ISharedAddressBooks } from '@next-common/types';

export interface IActiveMultisigContext extends ISharedAddressBooks {
	setActiveMultisigContextState: React.Dispatch<React.SetStateAction<IActiveMultisigContext>>;
}

export const initialActiveMultisigContext: IActiveMultisigContext = {
	multisig: '',
	records: {},
	roles: [],
	setActiveMultisigContextState: (): void => {
		throw new Error('setActiveMultisigContextState function must be overridden');
	}
};

export const ActiveMultisigContext = createContext(initialActiveMultisigContext);

export function useActiveMultisigContext() {
	return useContext(ActiveMultisigContext);
}

export const ActiveMultisigProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [activeMultisigContextState, setActiveMultisigContextState] =
		useState<IActiveMultisigContext>(initialActiveMultisigContext);

	const value = useMemo(
		() => ({ ...activeMultisigContextState, setActiveMultisigContextState }),
		[activeMultisigContextState]
	);

	return <ActiveMultisigContext.Provider value={value}>{children}</ActiveMultisigContext.Provider>;
};
