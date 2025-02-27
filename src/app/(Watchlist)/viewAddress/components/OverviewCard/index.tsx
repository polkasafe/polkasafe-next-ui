// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { DEFAULT_MULTISIG_NAME } from '@common/constants/defaults';
import { ENetwork } from '@common/enum/substrate';
import {
	BrainIcon,
	ChainIcon,
	CopyIcon,
	DonateIcon,
	PolkadotIcon,
	QRIcon,
	SubscanIcon
} from '@common/global-ui-components/Icons';
import copyText from '@common/utils/copyText';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import shortenAddress from '@common/utils/shortenAddress';
import Identicon from '@polkadot/react-identicon';
import { useAssets } from '@substrate/app/atoms/assets/assetsAtom';
import { Skeleton, Spin, Tooltip } from 'antd';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { networkConstants } from '@common/constants/substrateNetworkConstant';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import EditAddressName from '@common/modals/EditAddressName';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import EthIdenticon from '@common/global-ui-components/EthIdenticon';
const ExternalLink = ({ network, address }: { network: ENetwork; address: string }) => (
	<div className='absolute right-5 top-5'>
		<div className='flex gap-x-4 items-center'>
			<a
				className='w-5'
				target='_blank'
				href='https://polkadot.js.org/apps/#/accounts'
				rel='noreferrer'
			>
				<PolkadotIcon />
			</a>
			<a
				className='w-5'
				target='_blank'
				href={`https://explorer.polkascan.io/${network}/account/${address}`}
				rel='noreferrer'
			>
				<BrainIcon />
			</a>
			<a
				className='w-5'
				target='_blank'
				href={`https://dotscanner.com/${network}/account/${address}?utm_source=polkadotjs`}
				rel='noreferrer'
			>
				<DonateIcon />
			</a>
			<a
				className='w-5'
				target='_blank'
				href={`https://${network}.polkaholic.io/account/${address}?group=overview&chainfilters=all`}
				rel='noreferrer'
			>
				<ChainIcon />
			</a>
			<a
				className='w-5'
				target='_blank'
				href={`https://${network}.subscan.io/account/${address}`}
				rel='noreferrer'
			>
				<SubscanIcon />
			</a>
		</div>
	</div>
);

interface IOverviewCardProps {
	name: string;
	address: string;
	threshold: number;
	signatories: Array<string>;
	network: ENetwork;
	className?: string;
}

function OverviewCard({ address, name, threshold, signatories, network, className }: IOverviewCardProps) {
	const [data] = useAssets();
	const [organisation] = useOrganisation();

	const addressBook = organisation?.addressBook;

	const addressBookDetails = addressBook?.find(
		(item) => getSubstrateAddress(item.address) === getSubstrateAddress(address)
	);

	const proxyAddress = useSearchParams().get('_proxy');

	const multisig = organisation?.multisigs?.find((item) => item.address === address && item.network === network);
	const allProxies = multisig?.proxy || [];
	const proxy = allProxies.find((item) => item.address === proxyAddress);

	const selectedAddress = proxy?.address || address;
	const isProxy = !!proxy?.address;
	const assets = data?.assets;
	const proxyMultiSigAssets = assets
		?.map((a) => a.proxy || [])
		.flat()
		.find((a) => a.proxyAddress === selectedAddress && a.network === network);

	const multiSigAssets = assets?.find((asset) => asset?.address === selectedAddress && asset?.network === network);
	const selectedAddressAsset = isProxy ? proxyMultiSigAssets : multiSigAssets;
	const supportedTokens = networkConstants?.[network].supportedTokens || [];
	const allAssets: Array<{
		name: string;
		amount: string;
	}> = [
		{
			name: networkConstants?.[network].tokenSymbol,
			amount: selectedAddressAsset?.free || '0'
		}
	];
	supportedTokens.forEach((token: any) => {
		const id = token.name.toLocaleLowerCase();
		if ((selectedAddressAsset as any)?.[id]) {
			allAssets.push({
				name: token.name,
				amount: (selectedAddressAsset as any)?.[id]?.free || '0'
			});
		}
	});

	return (
		<div
			className={twMerge(
				'relative bg-bg-main flex flex-col justify-between rounded-3xl p-5 shadow-lg origin-top-left h-full',
				className
			)}
		>
			<ExternalLink
				address={selectedAddress}
				network={network}
			/>
			<div className='w-full'>
				<div className='flex gap-x-3 items-center'>
					<div className='relative'>
						{selectedAddress.startsWith('0x') ? (
							<EthIdenticon
								className={twMerge(
									`border-2 rounded-full bg-transparent border-primary p-1.5`,
									proxy && 'border-proxy-pink'
								)}
								address={selectedAddress}
								size={50}
							/>
						) : (
							<Identicon
								className={twMerge(
									`border-2 rounded-full bg-transparent border-primary p-1.5`,
									proxy && 'border-proxy-pink'
								)}
								value={selectedAddress}
								size={50}
								theme='substrate'
							/>
						)}
						<div
							className={twMerge(
								`bg-primary text-white text-sm rounded-lg absolute -bottom-0 left-[16px] px-2`,
								proxy && 'bg-proxy-pink'
							)}
						>
							{threshold}/{signatories.length}
						</div>
					</div>
					<div>
						<div className='text-base font-bold text-white flex items-center gap-x-2'>
							{addressBookDetails?.name || name || DEFAULT_MULTISIG_NAME}
							<EditAddressName address={selectedAddress} />
							<div
								className={twMerge(
									`px-2 py-[2px] rounded-md text-xs font-medium bg-primary text-white`,
									proxy && 'bg-proxy-pink text-black'
								)}
							>
								{proxy ? 'Proxy' : 'Multisig'}
							</div>
							<ParachainTooltipIcon
								size={15}
								src={networkConstants[network]?.logo}
								tooltip={network}
							/>
						</div>
						<div className='flex text-xs'>
							<div
								title={(selectedAddress && getEncodedAddress(selectedAddress, network)) || ''}
								className=' font-normal text-text_secondary'
							>
								{selectedAddress && shortenAddress(getEncodedAddress(selectedAddress, network) || '')}
							</div>
							<button
								className='ml-2 mr-1'
								onClick={() => copyText(selectedAddress, true, network)}
							>
								<CopyIcon className='text-primary' />
							</button>
							<Tooltip
								placement='right'
								className='cursor-pointer'
								title={
									<div className='p-2'>
										{/* <AddressQr
											size={100}
											address={address}
										/> */}
									</div>
								}
							>
								<QRIcon className='text-primary' />
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
			<div className='flex gap-x-5 flex-wrap text-xs'>
				{!signatories ? (
					<Skeleton
						paragraph={{ rows: 1, width: 150 }}
						active
					/>
				) : (
					<>
						<div>
							<div className='text-white'>Signatories</div>
							<div className='font-bold text-lg text-primary'>{signatories.length || 0}</div>
						</div>
						{allAssets.map((asset) =>
							Boolean(Number(asset.amount)) ? (
								<div>
									<div className='text-white'>{asset.name}</div>
									<div className='font-bold text-lg text-primary'>
										{!selectedAddressAsset ? <Spin size='default' /> : asset.amount}
									</div>
								</div>
							) : null
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default OverviewCard;
