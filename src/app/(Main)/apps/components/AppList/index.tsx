'use client';

import { ENetwork, ESupportedApps } from '@common/enum/substrate';
import { PolkassemblyIcon } from '@common/global-ui-components/Icons';
import AstarLogo from '@common/assets/parachains-logos/astar-logo.png';
import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
import { AppCard } from '@substrate/app/(Main)/apps/components/AppCard';
import Image from 'next/image';

const list = [
	{
		name: ESupportedApps.POLKASSEMBLY,
		link: 'https://polkadot.polkassembly.io/',
		description: 'The most unified platform to discuss and vote on governance proposals, motions and referandas.',
		logo: (
			<span className='text-6xl flex'>
				<PolkassemblyIcon />
			</span>
		),
		supportedNetworks: [
			'Polkadot',
			'Kusama',
			'Westend',
			'Astar',
			'Acala',
			'Moonriver',
			'Moonbeam',
			'Karura',
			'Shiden',
			'Plasm',
			'Darwinia',
			'Crust',
			'Phala',
			'Robonomics',
			'Subsocial'
		]
	},
	{
		name: ESupportedApps.ASTAR,
		link: 'https://astar.network/',
		logo: (
			<Image
				src={AstarLogo}
				width={50}
				height={50}
				alt='astar'
			/>
		),
		description: `Astar Network is a blockchain that aims to become Polkadot's "smart contract hub" and serves as a parachain for Polkadot`,
		supportedNetworks: ['Astar']
	},
	{
		name: ESupportedApps.SET_IDENTITY,
		logo: (
			<span className='text-6xl flex'>
				<PolkassemblyIcon />
			</span>
		),
		link: 'https://polkasafe.io/',
		description: 'Set On-Chain Identity for your Multisig Address',
		supportedNetworks: Object.keys(ENetwork)
	},
	{
		name: ESupportedApps.DELEGATE,
		logo: (
			<span className='text-6xl flex'>
				<PolkassemblyIcon />
			</span>
		),
		link: 'https://polkasafe.io/',
		description: 'Any account set as proxy will be able to perform actions in place of the proxied account',
		supportedNetworks: Object.keys(ENetwork)
	}
];
export const AppList = () => {
	return (
		<div className='flex gap-6 flex-wrap flex-1 overflow-y-auto'>
			{list.map((app) => (
				<AppCard
					description={app.description}
					name={app.name}
					logo={app.logo}
					supportedNetworks={app.supportedNetworks}
					url={app.link}
				/>
			))}
		</div>
	);
};
