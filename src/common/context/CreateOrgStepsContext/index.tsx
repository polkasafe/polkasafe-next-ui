import { ECreateOrganisationSteps } from '@common/enum/substrate';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

interface ICreateOrganisationProvider extends PropsWithChildren {
	step: ECreateOrganisationSteps;
	setStep: (newStep: ECreateOrganisationSteps) => void;
}

export const CreateOrgStepsContext = createContext({} as ICreateOrganisationProvider);

export function CreateOrgStepsProvider({ step, setStep, children }: ICreateOrganisationProvider) {
	const value = useMemo(
		() => ({
			step,
			setStep
		}),
		[step, setStep]
	);
	return <CreateOrgStepsContext.Provider value={value}>{children}</CreateOrgStepsContext.Provider>;
}

export const useOrgStepsContext = () => useContext(CreateOrgStepsContext);
