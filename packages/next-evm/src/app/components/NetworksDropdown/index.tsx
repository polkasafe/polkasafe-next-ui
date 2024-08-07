// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { chainProperties, NETWORK } from '@next-common/global/evm-network-constants';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';

import NetworkCard, { ParachainIcon } from './NetworkCard';

interface INetworksDropdownProps {
	isCardToken?: boolean;
	className?: string;
	iconClassName?: string;
	titleClassName?: string;
}

const NetworksDropdown: FC<INetworksDropdownProps> = ({ className, isCardToken, iconClassName, titleClassName }) => {
	const { network, setNetwork } = useGlobalApiContext();

	const url = typeof window !== 'undefined' && window.location.href;

	const subdomain = `${url}`.split('//')[1]?.split('.')[0];

	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleSetNetwork = async (networkToSet: string) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('network', networkToSet);
			localStorage.removeItem('active_multisig');
		}
		setNetwork(networkToSet as any);
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
				className={classNames(
					'flex items-center justify-center gap-x-4 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs',
					className
				)}
			>
				<p className={classNames('flex items-center')}>
					<span className={classNames('flex items-center w-4 h-4', iconClassName)}>
						<ParachainIcon src={chainProperties[network]?.logo} />
					</span>
					<span className={classNames('ml-[10px] hidden md:inline-flex capitalize', titleClassName)}>
						{isCardToken ? chainProperties[network].tokenSymbol : chainProperties[network].displayName}
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
				{subdomain === NETWORK.ASTAR ? (
					<NetworkCard
						onClick={() => handleSetNetwork(NETWORK.ASTAR)}
						selectedNetwork={network}
						key={NETWORK.ASTAR}
						network={NETWORK.ASTAR}
						isCardToken={isCardToken}
					/>
				) : (
					Object.values(NETWORK)
						.filter((item) => item !== NETWORK.ASTAR)
						.map((networkEntry) => {
							return (
								<NetworkCard
									onClick={() => handleSetNetwork(networkEntry)}
									selectedNetwork={network}
									key={networkEntry}
									network={networkEntry}
									isCardToken={isCardToken}
								/>
							);
						})
				)}
				{/* <NetworkCard
					onClick={() => handleSetNetwork(NETWORK.ASTAR)}
					selectedNetwork={network}
					key={NETWORK.ASTAR}
					network={NETWORK.ASTAR}
					isCardToken={isCardToken}
				/> */}
			</div>
		</div>
	);
};

export default NetworksDropdown;
