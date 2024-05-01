// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useRef, useState } from 'react';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { chainProperties, networks } from '@next-common/global/networkConstants';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';

import NetworkCard, { ParachainIcon } from './NetworkCard';

interface INetworksDropdownProps {
	isCardToken?: boolean;
	className?: string;
	iconClassName?: string;
	titleClassName?: string;
}

const NetworksDropdown = ({ className, isCardToken, iconClassName, titleClassName }: INetworksDropdownProps) => {
	const { network, setNetwork } = useGlobalApiContext();

	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleSetNetwork = (networkToSet: string) => {
		localStorage.setItem('network', networkToSet);
		setNetwork(networkToSet);
		toggleVisibility(false);
	};

	return (
		<div
			className='relative'
			onBlur={() => {
				if (!isMouseEnter.current && isVisible) {
					toggleVisibility(false);
				}
			}}
		>
			<button
				onClick={() => (isVisible ? toggleVisibility(false) : toggleVisibility(true))}
				className={`flex items-center justify-center gap-x-4 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs ${className}`}
			>
				<p className='flex items-center'>
					<span className={`flex items-center w-3 h-3 ${iconClassName}`}>
						<ParachainIcon src={chainProperties[network]?.logo} />
					</span>
					<span className={`ml-[10px] hidden md:inline-flex capitalize ${titleClassName}`}>
						{isCardToken ? chainProperties[network].tokenSymbol : network}
					</span>
				</p>
				<CircleArrowDownIcon className='hidden md:inline-flex text-sm text-primary' />
			</button>
			<div
				className={`absolute scale-90 top-[45px] left-[-50px] rounded-xl border border-primary bg-bg-secondary py-[13.5px] px-3 z-50 min-w-[214px] ${
					isVisible ? 'opacity-100 h-auto' : 'opacity-0 h-0 pointer-events-none hidden'
				}`}
				onMouseEnter={() => {
					isMouseEnter.current = true;
				}}
				onMouseLeave={() => {
					isMouseEnter.current = false;
				}}
			>
				{Object.values(networks).map((networkEntry) => {
					return (
						<NetworkCard
							onClick={() => handleSetNetwork(networkEntry)}
							selectedNetwork={network}
							key={networkEntry}
							network={networkEntry}
							isCardToken={isCardToken}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default NetworksDropdown;
