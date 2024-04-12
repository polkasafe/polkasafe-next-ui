// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable no-tabs */

'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export interface ICreateOrgStepsContext {
	step: number;
	setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const initialCreateOrgStepsContext: ICreateOrgStepsContext = {
	step: 0,
	setStep: (): void => {
		throw new Error('setStep function must be overridden');
	}
};

export const CreateOrgStepsContext = createContext(initialCreateOrgStepsContext);

export function useCreateOrgStepsContext() {
	return useContext(CreateOrgStepsContext);
}

export const CreateOrgStepsProvider = ({ children }: { children?: ReactNode }): ReactNode => {
	const [step, setStep] = useState<number>(0);

	const value = useMemo(
		() => ({
			step,
			setStep
		}),
		[step]
	);

	return <CreateOrgStepsContext.Provider value={value}>{children}</CreateOrgStepsContext.Provider>;
};
