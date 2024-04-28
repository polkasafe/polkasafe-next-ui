// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { OutlineCheckIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Tooltip } from 'antd';
import fallbackLogo from '@next-common/assets/fallback-token-logo.png';

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
	const [err, setErr] = useState<boolean>(false);
	useEffect(() => {
		setErr(false);
	}, [src]);
	return (
		<Tooltip title={tooltip}>
			<div className='flex items-center justify-center p-[2px] bg-white rounded-md'>
				<Image
					className={`${className} block rounded-full`}
					height={size}
					width={size}
					src={err || src === undefined ? fallbackLogo : src}
					onError={() => setErr(true)}
					alt='Chain logo'
				/>
			</div>
		</Tooltip>
	);
};

interface INetworkCardProps {
	selectedNetwork: string;
	onClick?: () => void;
	isCardToken?: boolean;
	network: string;
}

const NetworkCard: FC<INetworkCardProps> = ({ isCardToken, onClick, selectedNetwork, network }) => {
	const isSelected = selectedNetwork === network;

	return (
		<button
			onClick={onClick}
			className='border-none outline-none flex items-center justify-between w-full mb-1 min-w-[150px]'
		>
			<p className='flex items-center gap-x-[6px]'>
				<ParachainIcon
					size={15}
					src={chainProperties[network]?.logo}
				/>
				<span className={`font-medium text-sm capitalize ${isSelected ? 'text-primary' : 'text-white'}`}>
					{isCardToken ? chainProperties[network].tokenSymbol : chainProperties[network].displayName}
				</span>
			</p>
			{isSelected ? <OutlineCheckIcon className='text-primary' /> : null}
		</button>
	);
};

export default NetworkCard;
