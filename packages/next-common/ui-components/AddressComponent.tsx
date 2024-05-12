// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Identicon from '@polkadot/react-identicon';
import { Badge } from 'antd';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';

import { chainProperties, networks } from '@next-common/global/networkConstants';
import { ParachainIcon } from '@next-substrate/app/components/NetworksDropdown/NetworkCard';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import checkMultisigWithProxy from '@next-substrate/utils/checkMultisigWithProxy';
import { CopyIcon, ExternalLinkIcon } from './CustomIcons';

interface IAddressComponent {
	address: string;
	iconSize?: number;
	withBadge?: boolean;
	name?: string;
	onlyAddress?: boolean;
	isMultisig?: boolean;
	isProxy?: boolean;
	signatories?: number;
	threshold?: number;
	network?: string;
	showNetworkBadge?: boolean;
	addressLength?: number;
	fullAddress?: boolean;
	withEmail?: boolean;
}

const AddressComponent: React.FC<IAddressComponent> = ({
	address,
	name,
	withBadge = true,
	iconSize = 28,
	onlyAddress,
	isMultisig,
	isProxy,
	signatories,
	threshold,
	network,
	addressLength,
	fullAddress,
	withEmail,
	showNetworkBadge // eslint-disable-next-line sonarjs/cognitive-complexity
}: IAddressComponent) => {
	const { multisigSettings, selectedProxy } = useGlobalUserDetailsContext();

	const { activeOrg } = useActiveOrgContext();

	const addressBook = activeOrg?.addressBook || [];

	const multisig = activeOrg?.multisigs?.find(
		(item) => item.address === address || checkMultisigWithProxy(item.proxy || '', address)
	);

	const addressObj = addressBook?.find((item) => item?.address === address);

	const displayAddress = network ? getEncodedAddress(address, network) : getSubstrateAddress(address);

	const encodedMultisigAddress =
		getEncodedAddress(address, network || multisig?.network || networks.POLKADOT) || address;

	return (
		<div className=' flex items-center gap-x-3'>
			{(multisig?.proxy && getSubstrateAddress(selectedProxy || '') === getSubstrateAddress(address)) || isProxy ? (
				withBadge ? (
					<Badge
						count='Proxy'
						offset={[-45, 0]}
						className='border-none'
						color='#FF79F2'
					>
						<Identicon
							className='rounded-full border-2 border-proxy-pink bg-transparent p-1'
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
					</Badge>
				) : (
					<Identicon
						className='rounded-full border-2 border-proxy-pink bg-transparent p-1'
						value={address}
						size={iconSize}
						theme='polkadot'
					/>
				)
			) : multisig?.address === address || isMultisig ? (
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
					<div className='border-2 border-primary p-1 rounded-full flex justify-center items-center relative'>
						<Identicon
							value={address}
							size={iconSize}
							theme='polkadot'
						/>
						{!!threshold && !!signatories && (
							<div className=' bg-primary text-white text-xs rounded-md absolute bottom-0 px-2'>
								{threshold}/{signatories}
							</div>
						)}
					</div>
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
					<span className='text-white'>
						{addressObj?.nickName ||
							addressObj?.name ||
							multisigSettings[`${address}_${network}`]?.name ||
							shortenAddress(address || '', addressLength || 10)}
					</span>
					<span className='flex items-center gap-x-2 max-sm:gap-0'>
						<button onClick={() => copyText(address, true, network)}>
							<CopyIcon className='hover:text-primary' />
						</button>
						<a
							href={`https://${network || 'polkadot'}.subscan.io/account/${displayAddress}`}
							target='_blank'
							rel='noreferrer'
						>
							<ExternalLinkIcon />
						</a>
					</span>
				</div>
			) : (
				<div>
					<div className='font-medium text-sm flex items-center gap-x-3 text-white max-sm:text-xs'>
						{name ||
							addressObj?.nickName ||
							addressObj?.name ||
							multisigSettings[`${encodedMultisigAddress}_${network}`]?.name ||
							activeOrg?.multisigs.find((item) => item.address === address || item.proxy === address)?.name ||
							DEFAULT_ADDRESS_NAME}
						{network && showNetworkBadge && (
							<div
								style={{ backgroundColor: '#5065E4', fontSize: '9px' }}
								className='rounded-[4px] py-[0px] px-1 text-white flex items-center gap-x-1 bg-network_badge capitalize'
							>
								<ParachainIcon
									size={6}
									src={chainProperties[network]?.logo}
								/>
								{network}
							</div>
						)}
					</div>
					<div className='text-text_secondary flex items-center gap-x-3 text-xs font-normal max-sm:text-[8px]'>
						<span>{fullAddress ? displayAddress : shortenAddress(displayAddress || '', addressLength)}</span>
						<span className='flex items-center gap-x-2'>
							<button onClick={() => copyText(address, true, network)}>
								<CopyIcon className='hover:text-primary' />
							</button>
							<a
								href={`https://${network || 'polkadot'}.subscan.io/account/${displayAddress}`}
								target='_blank'
								rel='noreferrer'
							>
								<ExternalLinkIcon />
							</a>
						</span>
						{withEmail && addressObj?.email && (
							<div>
								<span className='text-xs text-text_secondary'>{addressObj.email}</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AddressComponent;
