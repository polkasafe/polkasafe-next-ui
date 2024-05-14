// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { AddIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import AddOwner from './Add';

const AddNewOwnerBtn = ({
	disabled,
	selectedProxy
}: {
	disabled?: boolean;
	selectedProxy: { address: string; name: string };
}) => {
	const [openAddOwnerModal, setOpenAddOwnerModal] = useState(false);

	return (
		<>
			<ModalComponent
				onCancel={() => setOpenAddOwnerModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Owners</h3>}
				open={openAddOwnerModal}
			>
				<AddOwner
					onCancel={() => setOpenAddOwnerModal(false)}
					selectedProxy={selectedProxy}
				/>
			</ModalComponent>
			<Button
				disabled={disabled}
				size='large'
				onClick={() => setOpenAddOwnerModal(true)}
				className={` outline-none border-none text-xs md:text-sm font-medium ${
					disabled ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'
				} rounded-md md:rounded-lg flex items-center gap-x-3`}
			>
				<AddIcon />
				<span>Add New Owner</span>
			</Button>
		</>
	);
};

export default AddNewOwnerBtn;
