// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { OutlineCheckIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Tooltip } from 'antd';

export const ParachainIcon = ({
	src,
	className,
	size = 20,
	tooltip
}: {
	src: string | StaticImport;
	className?: string;
	size?: number;
	tooltip?: string;
}) => {
	return (
		<Tooltip title={tooltip}>
			<div className='flex items-center justify-center p-[2px] bg-white rounded-md'>
				<Image
					className={`${className} block rounded-full`}
					height={size}
					width={size}
					src={src}
					alt='Chain logo'
				/>
			</div>
		</Tooltip>
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
				<ParachainIcon src={chainProperties[network].logo} />
				<span className={`font-medium text-sm capitalize ${isSelected ? 'text-primary' : 'text-white'}`}>
					{isCardToken ? chainProperties[network].tokenSymbol : chainProperties[network].displayName}
				</span>
			</p>
			{isSelected ? <OutlineCheckIcon className='text-primary' /> : null}
		</button>
	);
};

export default NetworkCard;
