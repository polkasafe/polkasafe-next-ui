'use client';

import { useOrgStepsContext } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps } from '@common/enum/substrate';
import { AddMultisigsToOrganisation } from '@common/global-ui-components/createOrganisation/components/AddMultisig';
import { OrganisationDetailForm } from '@common/global-ui-components/createOrganisation/components/OrganisationForm';
import { ReviewOrganisation } from '@common/global-ui-components/createOrganisation/components/ReviewOrganisation';

export const CreateOrganisation = () => {
	const { step } = useOrgStepsContext();
	return (
		<div className='w-[50%] h-full max-sm:w-full'>
			{step === ECreateOrganisationSteps.ORGANISATION_DETAILS ? (
				<OrganisationDetailForm />
			) : step === ECreateOrganisationSteps.ADD_MULTISIG ? (
				<AddMultisigsToOrganisation />
			) : step === ECreateOrganisationSteps.REVIEW ? (
				<ReviewOrganisation />
			) : null}
		</div>
	);
};
