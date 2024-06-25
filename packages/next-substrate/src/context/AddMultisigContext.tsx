// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface IAddMultisigContext {
	openAddMultisigModal: boolean;
	setOpenAddMultisigModal: React.Dispatch<React.SetStateAction<boolean>>;
	openProxyModal: boolean;
	setOpenProxyModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const initialAddMultisigContext: IAddMultisigContext = {
	openAddMultisigModal: false,
	setOpenAddMultisigModal: (): void => {
		throw new Error('setActiveMultisigContextState function must be overridden');
	},
	openProxyModal: false,
	setOpenProxyModal: (): void => {
		throw new Error('setActiveMultisigContextState function must be overridden');
	}
};

export const AddMultisigContext = createContext(initialAddMultisigContext);

export function useAddMultisigContext() {
	return useContext(AddMultisigContext);
}

export const AddMultisigProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [openAddMultisigModal, setOpenAddMultisigModal] = useState<boolean>(false);
	const [openProxyModal, setOpenProxyModal] = useState<boolean>(false);

	const value = useMemo(
		() => ({
			openAddMultisigModal,
			setOpenAddMultisigModal,
			openProxyModal,
			setOpenProxyModal
		}),
		[openAddMultisigModal, openProxyModal]
	);

	return <AddMultisigContext.Provider value={value}>{children}</AddMultisigContext.Provider>;
};
