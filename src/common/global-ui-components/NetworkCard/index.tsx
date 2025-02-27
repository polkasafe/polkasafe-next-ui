// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import { OutlineCheckIcon } from '@common/global-ui-components/Icons';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import { ENetwork } from '@common/enum/substrate';

interface INetworkCardProps {
	selectedNetwork: string;
	onClick?: () => void;
	isCardToken?: boolean;
	network: ENetwork;
}

const NetworkCard: FC<INetworkCardProps> = ({ isCardToken, onClick, selectedNetwork, network }) => {
	const isSelected = selectedNetwork === network;

	return (
		<button
			onClick={onClick}
			className='border-none outline-none flex items-center justify-between w-full mb-1 min-w-[150px]'
		>
			<p className='flex items-center gap-x-[6px]'>
				<ParachainTooltipIcon
					size={15}
					src={networkConstants[network]?.logo}
				/>
				<span className={`font-medium text-sm capitalize ${isSelected ? 'text-primary' : 'text-white'}`}>
					{isCardToken ? networkConstants[network].tokenSymbol : network}
				</span>
			</p>
			{isSelected ? <OutlineCheckIcon className='text-primary' /> : null}
		</button>
	);
};

export default NetworkCard;
