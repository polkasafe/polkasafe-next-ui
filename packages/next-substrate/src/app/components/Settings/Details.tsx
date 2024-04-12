// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_MULTISIG_NAME } from '@next-common/global/default';
import { DeleteIcon, EditIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import { IMultisigAddress } from '@next-common/types';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import RemoveMultisigAddress from './RemoveMultisig';
import RenameMultisig from './RenameMultisig';

const Details = ({ multisig }: { multisig: IMultisigAddress }) => {
	const { multisigSettings } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { network } = useGlobalApiContext();
	const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
	const [openRenameModal, setOpenRenameModal] = useState<boolean>(false);

	const encodedMultisigAddress = getEncodedAddress(multisig.address || '', multisig.network);

	return (
		<div className='h-full flex flex-col'>
			<ModalComponent
				onCancel={() => setOpenRemoveModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Remove Multisig</h3>}
				open={openRemoveModal}
			>
				<RemoveMultisigAddress
					multisig={multisig}
					onCancel={() => setOpenRemoveModal(false)}
				/>
			</ModalComponent>
			<ModalComponent
				onCancel={() => setOpenRenameModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Rename Multisig</h3>}
				open={openRenameModal}
			>
				<RenameMultisig
					multisig={multisig}
					name={
						multisigSettings?.[`${encodedMultisigAddress}_${network}`]?.name ||
						activeOrg?.multisigs?.find(
							(item) => item.address === multisig.address || item.address === encodedMultisigAddress
						)?.name ||
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
					<span className='text-white capitalize'>{network}</span>
				</div>
				{encodedMultisigAddress && (
					<div className='flex items-center justify-between gap-x-5 mt-7'>
						<span>Safe Name:</span>
						<span className='text-white flex items-center gap-x-3'>
							{multisigSettings?.[`${encodedMultisigAddress}_${network}`]?.name ||
								activeOrg?.multisigs?.find((item) => item.address === multisig.address || item.proxy === multisig.proxy)
									?.name ||
								DEFAULT_MULTISIG_NAME}
							<button onClick={() => setOpenRenameModal(true)}>
								<EditIcon className='text-primary cursor-pointer' />
							</button>
						</span>
					</div>
				)}
				<div className='flex-1' />
				<Button
					disabled={!encodedMultisigAddress}
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
