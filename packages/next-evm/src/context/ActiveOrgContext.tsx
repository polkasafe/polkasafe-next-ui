// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable no-tabs */

'use client';

import { IOrganisation } from '@next-common/types';
import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { useGlobalUserDetailsContext } from './UserDetailsContext';

export interface IActiveOrgContext {
	activeOrg?: IOrganisation;
	setActiveOrg: React.Dispatch<React.SetStateAction<IOrganisation>>;
}

export const initialActiveOrgContext: IActiveOrgContext = {
	setActiveOrg: (): void => {
		throw new Error('setActiveOrg function must be overridden');
	}
};

export const ActiveOrgContext = createContext(initialActiveOrgContext);

export function useActiveOrgContext() {
	return useContext(ActiveOrgContext);
}

export const ActiveOrgProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [activeOrg, setActiveOrg] = useState<IOrganisation>();
	const { organisations } = useGlobalUserDetailsContext();

	useEffect(() => {
		if (!organisations || organisations.length === 0) return;
		setActiveOrg(organisations?.[0]);
	}, [organisations]);

	const value = useMemo(
		() => ({
			activeOrg,
			setActiveOrg
		}),
		[activeOrg]
	);

	return <ActiveOrgContext.Provider value={value}>{children}</ActiveOrgContext.Provider>;
};
