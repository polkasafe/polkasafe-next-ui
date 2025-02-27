// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';

import { DollarCircleIcon } from '@common/global-ui-components/Icons';
import { SlideInMotion } from '@common/global-ui-components/Motion/SlideIn';
import Modal from '@common/global-ui-components/Modal';
import Button from '@common/global-ui-components/Button';
import DonateInfo from './DonateInfo';

const DonateButton = () => {
	const [openDonateModal, setOpenDonateModal] = useState(false);
	return (
		<SlideInMotion>
			<Modal
				onCancel={() => setOpenDonateModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold'>Donate Us!</h3>}
				open={openDonateModal}
			>
				<DonateInfo />
			</Modal>
			<Button
				icon={<DollarCircleIcon className='text-base text-waiting' />}
				onClick={() => setOpenDonateModal(true)}
				className='p-2 h-full px-4 border-2 border-waiting text-waiting text-sm bg-transparent flex'
			>
				Donate
			</Button>
		</SlideInMotion>
	);
};

export default DonateButton;
