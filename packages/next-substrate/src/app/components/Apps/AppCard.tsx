// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import astarLogo from '@next-common/assets/parachains-logos/astar-logo.png';
import polkaLogo from '@next-common/assets/polkassembly-logo.svg';
import subid from '@next-common/assets/subid.svg';

import Image from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AppModal from './AppModal';

const AppCard = ({ name, description }: { name: string; description: string }) => {
	const [openAppModal, setOpenAppModal] = useState<boolean>(false);
	const logo = name === 'Polkassembly' ? polkaLogo : name === 'Sub ID' ? subid : astarLogo;
	return (
		<>
			<ModalComponent
				open={openAppModal}
				title=''
				onCancel={() => setOpenAppModal(false)}
			>
				<AppModal
					onCancel={() => setOpenAppModal(false)}
					name={name}
					description={description}
				/>
			</ModalComponent>
			{
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div
					className='bg-bg-secondary flex flex-col cursor-pointer rounded-lg px-[16px] py-[20px] w-[380px] min-h-[260px]'
					onClick={() => setOpenAppModal(true)}
				>
					<div className='flex flex-col gap-5'>
						<Image
							src={logo}
							alt={name}
							className='w-[50px] h-[50px]'
						/>
						<div className='flex flex-col gap-[10px]'>
							<div className='text-2xl text-white font-semibold'>{name}</div>
							<div className='text-[#8B8B8B] font-medium text-base leading-tight font-archivo'>{description}</div>
						</div>
					</div>
				</div>
			}
		</>
	);
};
export default AppCard;
