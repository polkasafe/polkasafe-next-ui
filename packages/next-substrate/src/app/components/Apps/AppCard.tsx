// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { ReactElement, useState } from 'react';

import Image, { StaticImageData } from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import AppModal from './AppModal';

const AppCard = ({
	className,
	name,
	description,
	appUrl,
	logoComponent,
	logoUrl,
	newTab,
	modal,
	modalComponent
}: {
	className?: string;
	name: string;
	description: string;
	appUrl: string;
	logoUrl: string | StaticImageData;
	logoComponent: ReactElement;
	newTab?: boolean;
	modal?: boolean;
	modalComponent?: ReactElement;
}) => {
	const [openAppModal, setOpenAppModal] = useState<boolean>(false);
	return (
		<>
			<ModalComponent
				open={openAppModal}
				title={modal ? name : ''}
				onCancel={() => setOpenAppModal(false)}
			>
				{modal && modalComponent ? (
					modalComponent
				) : (
					<AppModal
						appUrl={appUrl}
						onCancel={() => setOpenAppModal(false)}
						name={name}
						description={description}
						newTab={newTab}
					/>
				)}
			</ModalComponent>
			{
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div
					className={`bg-bg-secondary flex flex-col cursor-pointer rounded-lg px-[16px] py-[20px] min-h-[260px] ${className}`}
					onClick={() => setOpenAppModal(true)}
				>
					<div className='flex flex-col gap-5'>
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={name}
								className='w-[50px] h-[50px]'
							/>
						) : (
							<span className='text-[50px] flex'>{logoComponent}</span>
						)}
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
