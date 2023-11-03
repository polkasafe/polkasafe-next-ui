// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import shortenAddress from '@next-evm/utils/shortenAddress';
import styled from 'styled-components';

interface IAddressProps {
	address: string;
	className?: string;
	disableAddress?: boolean;
	disableIdenticon?: boolean;
	disableExtensionName?: boolean;
	displayInline?: boolean;
	extensionName?: string;
	identiconSize?: number;
	shortenAddressLength?: number;
}

const Address: FC<IAddressProps> = ({
	address,
	className,
	displayInline,
	disableIdenticon,
	disableAddress,
	disableExtensionName,
	extensionName,
	identiconSize,
	shortenAddressLength
}: IAddressProps) => {
	return (
		<div
			className={`flex items-center gap-x-3 w-full text-text_secondary ${displayInline && 'inline-flex'} ${className}`}
		>
			{!disableIdenticon ? (
				<MetaMaskAvatar
					address={address}
					size={identiconSize || 30}
				/>
			) : null}
			<p className='flex flex-col gap-y-[6px] font-normal text-xs leading-[13px]'>
				{!disableExtensionName ? <span className='text-white'>{extensionName}</span> : null}
				{!disableAddress ? (
					<span>{shortenAddressLength === 0 ? address : shortenAddress(address, shortenAddressLength)}</span>
				) : null}
			</p>
		</div>
	);
};

export default styled(Address)``;
