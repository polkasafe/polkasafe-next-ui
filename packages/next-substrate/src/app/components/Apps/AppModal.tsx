// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import astarLogo from '@next-common/assets/parachains-logos/astar-logo.png';
import { useGlobalDAppContext } from '@next-substrate/context/DAppContext';
import { networks } from '@next-common/global/networkConstants';
import { ArrowRightIcon, PolkassemblyIcon, SubIDIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';

const AppModal = ({
	name,
	description,
	appUrl,
	onCancel,
	newTab
}: {
	name: string;
	description: string;
	onCancel: () => void;
	appUrl: string;
	newTab?: boolean;
	// modal?: boolean;
}) => {
	const { setIframeVisibility } = useGlobalDAppContext();
	return (
		<div className='flex flex-col cursor-pointer justify-around rounded-lg scale-90 w-[100%] -mt-[25px] -mb-[25px] origin-top-left'>
			<div className='flex flex-col overflow-auto w-[110%]'>
				{name === 'Astar' ? (
					<Image
						src={astarLogo}
						alt={name}
						className='w-[50px] h-[50px]'
					/>
				) : (
					<span className='text-[50px] flex'>{name === 'Polkassembly' ? <PolkassemblyIcon /> : <SubIDIcon />}</span>
				)}
				<div className='mt-3'>
					<div className='text-3xl text-white font-semibold'>{name}</div>
					<div className='mt-2 text-[#8B8B8B] font-medium text-14 leading-tight font-archivo max-w-[450px]'>
						{description}
					</div>
				</div>
				<div className='mt-5 flex flex-col gap-3'>
					<div className='text-[#8B8B8B] font-medium text-base text-14 leading-tight font-archivo'>
						Available networks
					</div>
					<div className='flex gap-2 flex-wrap max-w-[400px]'>
						{name === 'Astar' ? (
							<button className='rounded-lg py-2 px-[10px] text-sm leading-[15px] text-white text-primary bg-highlight'>
								{' '}
								astar{' '}
							</button>
						) : (
							Object.values(networks).map((net) => (
								<button
									key={net}
									className='rounded-lg py-2 px-[10px] text-sm leading-[15px] text-white text-primary bg-highlight'
								>
									{' '}
									{net}{' '}
								</button>
							))
						)}
					</div>
				</div>
				<button
					className='mt-10 text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-1 cursor-pointer'
					onClick={() => {
						if (appUrl && newTab) {
							window.open(`${appUrl}`, '_blank');
						} else {
							setIframeVisibility(appUrl);
						}
						onCancel();
					}}
				>
					<span className='font-medium text-xs'>Open app</span>
					<ArrowRightIcon className='text-sm' />
				</button>
			</div>
		</div>
	);
};
export default AppModal;
