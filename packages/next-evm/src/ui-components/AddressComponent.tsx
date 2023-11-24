// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Badge } from 'antd';
import React from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useActiveMultisigContext } from '@next-evm/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';

import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import { chainProperties } from '@next-common/global/evm-network-constants';

interface IAddressComponent {
	address: string;
	iconSize?: number;
	withBadge?: boolean;
	name?: string;
	onlyAddress?: boolean;
}

const AddressComponent = ({ address, name, withBadge = true, iconSize = 30, onlyAddress }: IAddressComponent) => {
	const { network } = useGlobalApiContext();
	const { addressBook, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	const addressObj = addressBook?.find((item) => item.address === address);

	return (
		<div className=' flex items-center gap-x-3'>
			{multisig?.address === address ? (
				withBadge ? (
					<Badge
						count='Multisig'
						offset={[-45, 0]}
						className='border-none'
						color='#1573FE'
					>
						<div className='border-2 border-primary p-1 rounded-full flex justify-center items-center'>
							<MetaMaskAvatar
								size={iconSize}
								address={address}
							/>
						</div>
					</Badge>
				) : (
					<div className='border-2 border-primary p-1 rounded-full flex justify-center items-center'>
						<MetaMaskAvatar
							address={address}
							size={iconSize}
						/>
					</div>
				)
			) : (
				<MetaMaskAvatar
					address={address}
					size={iconSize}
				/>
			)}
			{onlyAddress ? (
				<div className='flex items-center gap-x-3 font-normal text-sm text-text_secondary'>
					<span className='text-white'>
						{addressObj?.nickName ||
							addressObj?.name ||
							multisigAddresses.find((item) => item.address === address)?.name ||
							records?.[address]?.name ||
							shortenAddress(address || '', 10)}
					</span>
					<span className='flex items-center gap-x-2'>
						<button onClick={() => copyText(address)}>
							<CopyIcon className='hover:text-primary' />
						</button>
						<a
							href={`${chainProperties[network].blockExplorer}/address/${address}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</span>
				</div>
			) : (
				<div>
					<div className='font-medium text-sm flex text-white'>
						{name ||
							addressObj?.nickName ||
							addressObj?.name ||
							multisigAddresses.find((item) => item.address === address)?.name ||
							records?.[address]?.name ||
							DEFAULT_ADDRESS_NAME}
					</div>
					<div className='flex items-center gap-x-3 font-normal text-xs text-text_secondary'>
						<span>{shortenAddress(address || '')}</span>
						<span className='flex items-center gap-x-2'>
							<button onClick={() => copyText(address)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`${chainProperties[network].blockExplorer}/address/${address}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default AddressComponent;
