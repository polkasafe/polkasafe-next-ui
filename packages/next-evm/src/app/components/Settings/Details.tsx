// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import { DeleteIcon, EditIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { IMultisigAddress } from '@next-common/types';
import RemoveMultisigAddress from './RemoveMultisig';
import RenameMultisig from './RenameMultisig';

const Details = ({ multisig }: { multisig: IMultisigAddress }) => {
	const { multisigAddresses, multisigSettings } = useGlobalUserDetailsContext();
	const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
	const [openRenameModal, setOpenRenameModal] = useState<boolean>(false);

	return (
		<div className='h-full flex flex-col'>
			<ModalComponent
				onCancel={() => setOpenRemoveModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Multisig</h3>}
				open={openRemoveModal}
			>
				<RemoveMultisigAddress onCancel={() => setOpenRemoveModal(false)} />
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenRenameModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Rename Multisig</h3>}
				open={openRenameModal}
			>
				<RenameMultisig
					multisig={multisig}
					name={
						multisigSettings?.[`${multisig.address}_${multisig.network}`]?.name ||
						multisigAddresses.find((item) => item.address === multisig.address)?.name ||
						DEFAULT_MULTISIG_NAME
					}
					onCancel={() => setOpenRenameModal(false)}
				/>
			</ModalComponent>
			<h2 className='font-semibold text-lg leading-[22px] text-white mb-4'>Details</h2>
			<article className=' flex flex-col flex-1 bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center justify-between gap-x-5'>
					<span>Version:</span>
					<span className='bg-highlight text-primary flex items-center gap-x-3 rounded-lg px-2 py-[10px] font-medium'>
						1.0
						{/* <ExternalLinkIcon className='text-primary' /> */}
					</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-5'>
					<span>Blockchain:</span>
					<span className='text-white capitalize'>{multisig.network}</span>
				</div>
				{multisig && multisig.address && (
					<div className='flex items-center justify-between gap-x-5 mt-7'>
						<span>Safe Name:</span>
						<span className='text-white flex items-center gap-x-3'>
							{multisigSettings?.[`${multisig.address}_${multisig.network}`]?.name ||
								multisigAddresses?.find((item) => item.address === multisig.address)?.name ||
								DEFAULT_MULTISIG_NAME}
							<button onClick={() => setOpenRenameModal(true)}>
								<EditIcon className='text-primary cursor-pointer' />
							</button>
						</span>
					</div>
				)}
				<div className='flex-1' />
				<Button
					disabled={!multisig.address}
					size='large'
					onClick={() => setOpenRemoveModal(true)}
					className='border-none outline-none text-failure bg-failure bg-opacity-10 flex items-center gap-x-3 justify-center rounded-lg p-[10px] w-full mt-7'
				>
					<DeleteIcon />
					<span>Remove Safe</span>
				</Button>
			</article>
		</div>
	);
};

export default Details;
