// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { DollarIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import DonateInfo from './DonateInfo';

const DonateBtn = () => {
	const [openDonateModal, setOpenDonateModal] = useState(false);
	return (
		<div className='relative'>
			<ModalComponent
				onCancel={() => setOpenDonateModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold'>Donate Us!</h3>}
				open={openDonateModal}
			>
				<DonateInfo />
			</ModalComponent>
			<button
				onClick={() => setOpenDonateModal(true)}
				className='flex items-center justify-center gap-x-2 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'
			>
				<DollarIcon className='text-sm text-primary' />
				<span className='hidden md:inline-flex text-primary'>Donate</span>
			</button>
		</div>
	);
};

export default DonateBtn;
