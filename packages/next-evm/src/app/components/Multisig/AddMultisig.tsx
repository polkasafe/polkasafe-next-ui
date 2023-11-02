// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React, { useState } from 'react';
import CreateMultisig from '@next-evm/app/components/Multisig/CreateMultisig';
import { CreateMultisigIcon, LinkIcon } from '@next-common/ui-components/CustomIcons';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import LinkMultisig from './LinkMultisig/LinkMultisig';

interface IMultisigProps {
	className?: string;
	isModalPopup?: boolean;
	homepage?: boolean;
	onCancel?: () => void;
}

const AddMultisig: React.FC<IMultisigProps> = ({ isModalPopup, homepage, className, onCancel }) => {
	const [isMultisigVisible, setMultisigVisible] = useState(false);
	const [openLinkMultisig, setOpenLinkMultisig] = useState(false);
	const [openCreateMultisig, setOpenCreateMultisig] = useState(false);

	return (
		<div className={className}>
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Multisig</h3>}
				open={openCreateMultisig}
				onCancel={() => setOpenCreateMultisig(false)}
			>
				<CreateMultisig
					onCancel={() => {
						setOpenCreateMultisig(false);
						onCancel?.();
					}}
				/>
			</ModalComponent>
			<ModalComponent
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Link Multisig</h3>}
				open={openLinkMultisig}
				onCancel={() => setOpenLinkMultisig(false)}
			>
				<LinkMultisig
					onCancel={() => {
						setOpenLinkMultisig(false);
						onCancel?.();
					}}
				/>
			</ModalComponent>
			{isMultisigVisible && !isModalPopup ? (
				<div className='p-5'>
					<CreateMultisig
						homepage={homepage}
						onCancel={() => {
							setMultisigVisible(false);
						}}
					/>
				</div>
			) : (
				<div className='h-full flex flex-col justify-center'>
					<div className='p-5'>
						<div className='text-center mb-10'>
							<h1 className='text-lg font-bold text-white'>Add Multisig</h1>
							<p className='text-white'>
								MultiSig is a secure digital wallet that requires one or multiple owners to authorize the transaction.
							</p>
							<br />
							<p className='text-text_secondary'>To add a MultiSig you can choose from the options below:</p>
						</div>
						<div className='flex justify-center mt-5 w-full px-10'>
							<div className='flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 mx-5'>
								<div className='mb-5'>
									<h1 className='font-bold text-md mb-2 text-white'>Create Multisig</h1>
									<p className='text-text_secondary text-sm'>
										Create a new MultiSig that is controlled by one or multiple owners.
									</p>
								</div>
								<div>
									<Button
										className='flex items-center justify-center bg-primary text-white w-[100%] border-none'
										onClick={() => {
											if (!isModalPopup) {
												setMultisigVisible(true);
											} else {
												setOpenCreateMultisig(true);
											}
										}}
									>
										<CreateMultisigIcon /> Multisig
									</Button>
								</div>
							</div>
							<div className='flex flex-col w-[50%] items-left justify-between bg-bg-secondary rounded-lg p-5 mx-5'>
								<div className='mb-5'>
									<h1 className='font-bold text-md mb-2 text-white'>Link Multisig</h1>
									<p className='text-text_secondary text-sm'>
										Already have a MultiSig? You can link your existing multisig with a few simple steps.
									</p>
								</div>
								<div>
									<Button
										className='flex items-center justify-center bg-primary text-primary bg-opacity-10 w-[100%] border-none'
										onClick={() => setOpenLinkMultisig(true)}
									>
										<LinkIcon />
										Link Multisig
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AddMultisig;