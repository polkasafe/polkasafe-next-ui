// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import React from 'react';
import { useAddMultisigContext } from '@next-substrate/context/AddMultisigContext';
import AddMultisig from './AddMultisig';

const AddMultisigModal = () => {
	const { openAddMultisigModal, setOpenAddMultisigModal } = useAddMultisigContext();

	return (
		<ModalComponent
			onCancel={() => setOpenAddMultisigModal(false)}
			open={openAddMultisigModal}
			title=''
		>
			<AddMultisig
				onCancel={() => setOpenAddMultisigModal(false)}
				isModalPopup
			/>
		</ModalComponent>
	);
};

export default AddMultisigModal;
