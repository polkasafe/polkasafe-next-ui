// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { chainProperties } from '@next-common/global/networkConstants';
import { OutlineCheckIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';

export const ParachainIcon: FC<{ src: string; className?: string; size?: number }> = ({
	src,
	className,
	size = 20
}) => {
	return (
		<Image
			className={`${className} block rounded-full`}
			height={size}
			width={size}
			src={src}
			alt='Chain logo'
		/>
	);
};

interface INetworkCardProps {
	selectedNetwork: string;
	onClick: () => void;
	isCardToken?: boolean;
	network: string;
}

const NetworkCard: FC<INetworkCardProps> = ({ isCardToken, onClick, selectedNetwork, network }) => {
	const isSelected = selectedNetwork === network;

	return (
		<button
			onClick={onClick}
			className={`border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-2 min-w-[190px] ${
				isSelected && 'bg-highlight'
			}`}
		>
			<p className='flex items-center gap-x-[6px]'>
				<span className='h-4 w-4'>
					<ParachainIcon src={chainProperties[network].logo} />
				</span>
				<span className={`font-medium text-sm capitalize ${isSelected ? 'text-primary' : 'text-white'}`}>
					{isCardToken ? chainProperties[network].tokenSymbol : network}
				</span>
			</p>
			{isSelected ? <OutlineCheckIcon className='text-primary' /> : null}
		</button>
	);
};

export default NetworkCard;
