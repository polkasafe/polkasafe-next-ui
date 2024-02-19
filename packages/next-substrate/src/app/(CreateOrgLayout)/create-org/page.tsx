// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import CreateOrg from '@next-substrate/app/components/CreateOrg';
import AddressDropdown from '@next-substrate/app/components/AddressDropdown';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';

const CreateOrganisation = () => {
	const router = useRouter();
	const { userID, loading } = useGlobalUserDetailsContext();

	useEffect(() => {
		if (!userID && !loading) router.replace('/login');
	}, [loading, router, userID]);

	return (
		<div className='flex flex-col'>
			<div className='flex justify-end mb-10 pr-20'>
				<AddressDropdown />
			</div>
			<div className='flex w-full justify-center flex-1 overflow-y-auto'>
				<CreateOrg />
			</div>
		</div>
	);
};

export default CreateOrganisation;
