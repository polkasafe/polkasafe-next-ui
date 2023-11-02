// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import AllApps from '@next-evm/app/components/Apps';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

const Apps = () => {
	return (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left'>
			<AddMultisigModal />
			<AllApps />
		</div>
	);
};

export default Apps;
