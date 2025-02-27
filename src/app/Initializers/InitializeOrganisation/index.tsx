// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { organisationAtom } from '@substrate/app/atoms/organisation/organisationAtom';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { useSetAtom } from 'jotai/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getOrganisationById } from '@sdk/polkasafe-sdk/src/get-organisation-by-id';
import { IOrganisation } from '@common/types/substrate';

function InitializeOrganisation() {
	const searchParams = useSearchParams();
	const organisationId = searchParams.get('_organisation');
	const [user] = useUser();
	const setAtom = useSetAtom(organisationAtom);

	const handleOrganisation = async () => {
		if (!user || !organisationId) return;
		const organisation = (await getOrganisationById({
			address: user.address,
			signature: user.signature,
			organisationId
		})) as { data: IOrganisation };

		if (!organisation.data) {
			throw new Error('Organisation not found');
		}
		setAtom(organisation.data);
	};

	useEffect(() => {
		if (!organisationId) {
			return;
		}
		handleOrganisation();
	}, [organisationId]);

	return null;
}

export default InitializeOrganisation;
