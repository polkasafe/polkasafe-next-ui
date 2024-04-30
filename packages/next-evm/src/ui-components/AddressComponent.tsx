// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Badge } from 'antd';
import React from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';

import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';

interface IAddressComponent {
	address: string;
	iconSize?: number;
	withBadge?: boolean;
	name?: string;
	onlyAddress?: boolean;
	addressLength?: number;
	isMultisig?: boolean;
	signatories?: number;
	threshold?: number;
	network?: NETWORK;
	fullAddress?: boolean;
	showNetworkBadge?: boolean;
	withEmail?: boolean;
}

const AddressComponent = ({
	address,
	name,
	withBadge = true,
	iconSize = 30,
	onlyAddress,
	addressLength,
	isMultisig,
	signatories,
	threshold,
	network,
	fullAddress,
	showNetworkBadge,
	withEmail
}: IAddressComponent) => {
	const { multisigAddresses, multisigSettings } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const addressBook = activeOrg?.addressBook || [];

	const multisig = multisigAddresses?.find((item) => item.address === address);

	const addressObj = addressBook?.find((item) => item?.address?.toLowerCase() === address.toLowerCase());

	return (
		<div className=' flex items-center gap-x-3'>
			{multisig?.address || isMultisig ? (
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
					<div className='border-2 border-primary p-1 rounded-full flex justify-center items-center relative'>
						<MetaMaskAvatar
							address={address}
							size={iconSize}
						/>
						{threshold && signatories && (
							<div className=' bg-primary text-white text-xs rounded-md absolute bottom-[-3px] left-[4px] px-2'>
								{threshold}/{signatories}
							</div>
						)}
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
							multisigSettings[`${address}_${network}`]?.name ||
							shortenAddress(address || '', addressLength || 10)}
					</span>
					<span className='flex items-center gap-x-2'>
						<button onClick={() => copyText(address)}>
							<CopyIcon className='hover:text-primary' />
						</button>
						<a
							href={`${chainProperties[network || NETWORK.ETHEREUM].blockExplorer}/address/${address}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</span>
				</div>
			) : (
				<div>
					<div className='font-medium text-sm flex items-center gap-x-3 text-white'>
						{name ||
							addressObj?.nickName ||
							addressObj?.name ||
							multisigAddresses.find((item) => item.address === address)?.name ||
							multisigSettings[`${address}_${network}`]?.name ||
							DEFAULT_ADDRESS_NAME}
						{network && showNetworkBadge && (
							<div className='rounded-[4px] py-[0px] px-1 text-[9px] text-white flex items-center gap-x-1 bg-[#5065E4] capitalize'>
								<ParachainIcon
									size={6}
									src={chainProperties[network].logo}
								/>
								{network}
							</div>
						)}
					</div>
					<div className='flex items-center gap-x-3 font-normal text-xs text-text_secondary'>
						<span>{fullAddress ? address : shortenAddress(address || '')}</span>
						<span className='flex items-center gap-x-2'>
							<button onClick={() => copyText(address)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`${chainProperties[network || NETWORK.ETHEREUM].blockExplorer}/address/${address}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</span>
					</div>
					{withEmail && addressObj.email && (
						<div>
							<span className='text-xs text-text_secondary'>{addressObj.email}</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default AddressComponent;
