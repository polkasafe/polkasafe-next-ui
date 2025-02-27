'use client';

import NextTopLoader from 'nextjs-toploader';
import '@common/styles/globals.scss';
import CreateOrganisationLayout from '@common/global-ui-components/CreateOrganisationLayout';
import { PropsWithChildren, useState } from 'react';
import { CreateOrgStepsProvider } from '@common/context/CreateOrgStepsContext';
import { ECreateOrganisationSteps } from '@common/enum/substrate';

export default function CreateOrgLayout({ children }: PropsWithChildren) {
	const [step, setStep] = useState<ECreateOrganisationSteps>(ECreateOrganisationSteps.ORGANISATION_DETAILS);
	return (
		<html lang='en'>
			<body>
				<NextTopLoader />
				<CreateOrgStepsProvider
					step={step}
					setStep={setStep}
				>
					<CreateOrganisationLayout>{children}</CreateOrganisationLayout>
				</CreateOrgStepsProvider>
			</body>
		</html>
	);
}
