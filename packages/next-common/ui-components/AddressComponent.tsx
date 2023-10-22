// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Identicon from '@polkadot/react-identicon';
import { Badge } from 'antd';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import { CopyIcon, ExternalLinkIcon } from './CustomIcons';

interface IAddressComponent {
	address: string;
	iconSize?: number;
	withBadge?: boolean;
	name?: string;
	onlyAddress?: boolean;
}

const AddressComponent: React.FC<IAddressComponent> = ({
	address,
	name,
	withBadge = true,
	iconSize = 30,
	onlyAddress
}: IAddressComponent) => {
	const { network } = useGlobalApiContext();
	const { addressBook, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	const addressObj = addressBook?.find((item) => item.address === address);

	return (
		<div className=' flex items-center gap-x-3'>
			{multisig?.proxy && getSubstrateAddress(multisig.proxy) === getSubstrateAddress(address) ? (
				withBadge ? (
					<Badge
						count='Proxy'
						offset={[-45, 0]}
						className='border-none'
						color='#FF79F2'
					>
						<Identicon
							className='rounded-full border-2 border-[#FF79F2] bg-transparent p-1'
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
					</Badge>
				) : (
					<Identicon
						className='rounded-full border-2 border-[#FF79F2] bg-transparent p-1'
						value={address}
						size={iconSize}
						theme='polkadot'
					/>
				)
			) : multisig?.address === address ? (
				withBadge ? (
					<Badge
						count='Multisig'
						offset={[-45, 0]}
						className='border-none'
						color='#1573FE'
					>
						<Identicon
							className='border-primary rounded-full border-2 bg-transparent p-1'
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
					</Badge>
				) : (
					<Identicon
						className='border-primary rounded-full border-2 bg-transparent p-1'
						value={address}
						size={iconSize}
						theme='polkadot'
					/>
				)
			) : (
				<Identicon
					value={address}
					size={iconSize}
					theme='polkadot'
				/>
			)}
			{onlyAddress ? (
				<div className='text-text_secondary flex items-center gap-x-3 text-sm font-normal'>
					<span className='text-white'>{shortenAddress(getEncodedAddress(address, network) || '', 10)}</span>
					<span className='flex items-center gap-x-2'>
						<button onClick={() => copyText(address, true, network)}>
							<CopyIcon className='hover:text-primary' />
						</button>
						<a
							href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</span>
				</div>
			) : (
				<div>
					<div className='flex text-sm font-medium text-white'>
						{name ||
							addressObj?.nickName ||
							addressObj?.name ||
							multisigAddresses.find(
								(item) => (item.address === address || item.proxy === address) && item.network === network
							)?.name ||
							records?.[getSubstrateAddress(address) || address]?.name ||
							DEFAULT_ADDRESS_NAME}
					</div>
					<div className='text-text_secondary flex items-center gap-x-3 text-xs font-normal'>
						<span>{shortenAddress(getEncodedAddress(address, network) || '')}</span>
						<span className='flex items-center gap-x-2'>
							<button onClick={() => copyText(address, true, network)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`https://${network}.subscan.io/account/${getEncodedAddress(address, network)}`}
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
