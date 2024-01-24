// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { AddIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { IMultisigAddress } from '@next-common/types';
import AddOwner from './Add';

const AddNewOwnerBtn = ({ disabled, multisig }: { disabled?: boolean; multisig: IMultisigAddress }) => {
	const [openAddOwnerModal, setOpenAddOwnerModal] = useState(false);

	return (
		<>
			<ModalComponent
				onCancel={() => setOpenAddOwnerModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Owners</h3>}
				open={openAddOwnerModal}
			>
				<AddOwner
					multisig={multisig}
					onCancel={() => setOpenAddOwnerModal(false)}
				/>
			</ModalComponent>
			<div className='flex justify-end mt-2'>
				<Button
					disabled={disabled}
					size='large'
					onClick={() => setOpenAddOwnerModal(true)}
					className={`outline-none border-none text-xs md:text-sm font-medium ${
						disabled ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'
					} rounded-md md:rounded-lg flex items-center gap-x-3`}
				>
					<AddIcon />
					<span>Add New Owner</span>
				</Button>
			</div>
		</>
	);
};

export default AddNewOwnerBtn;
