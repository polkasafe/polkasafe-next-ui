// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactElement } from 'react';
import Link from 'next/link';
// import Details from '@next-substrate/app/components/Settings/Details';
import Feedback from '@next-substrate/app/components/Settings/Feedback';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { ExternalLinkIcon, PolkassemblyIcon, SubIDIcon } from '@next-common/ui-components/CustomIcons';

import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import astarLogo from '@next-common/assets/parachains-logos/astar-logo.png';
import { StaticImageData } from 'next/image';
import AppCard from './AppCard';
import SendFundsForm, { ETransactionType } from '../SendFunds/SendFundsForm';
import CreateProposal from './CreateProposal';
// import VoteOnProposal from './VoteOnProposal';

export interface IAppData {
	name: string;
	description: string;
	logoUrl?: string | StaticImageData;
	logoComponent?: ReactElement;
	appUrl?: string;
	newTab?: boolean;
	modal?: boolean;
	modalComponent?: ReactElement;
}

const currentApps: IAppData[] = [
	{
		appUrl: 'https://sub.id/',
		description: 'One Stop Shop For All Substrate Addresses And Balances',
		logoComponent: <SubIDIcon />,
		name: 'Sub ID'
	},
	{
		appUrl: 'https://polkadot.polkassembly.io/',
		description: 'The most unified platform to discuss and vote on governance proposals, motions and referandas',
		logoComponent: <PolkassemblyIcon />,
		name: 'Polkassembly',
		newTab: true
	},
	{
		appUrl: 'https://portal.astar.network/astar/dapp-staking/discover',
		description:
			'Astar Network is a blockchain that aims to become Polkadot\'s "smart contract hub" and serves as a parachain for Polkadot',
		logoUrl: astarLogo,
		name: 'Astar',
		newTab: true
	},
	{
		description: 'Create Proposal',
		logoComponent: <PolkassemblyIcon />,
		modal: true,
		modalComponent: <CreateProposal />,
		name: 'Create Proposal'
	},
	// {
	// description: 'Vote on Proposal',
	// logoComponent: <PolkassemblyIcon />,
	// modal: true,
	// modalComponent: <VoteOnProposal />,
	// name: 'Vote on Proposal'
	// },
	{
		description: 'Set On-Chain Identity for your Multisig Address',
		logoComponent: <PolkassemblyIcon />,
		modal: true,
		modalComponent: <SendFundsForm transactionType={ETransactionType.SET_IDENTITY} />,
		name: 'Set Identity'
	},
	{
		description: 'Any account set as proxy will be able to perform actions in place of the proxied account',
		logoComponent: <PolkassemblyIcon />,
		modal: true,
		modalComponent: <SendFundsForm transactionType={ETransactionType.DELEGATE} />,
		name: 'Delegate'
	}
];

const AllApps = () => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	return (
		<div>
			{!activeOrg || !activeOrg.multisigs ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>
						Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.
					</p>
				</section>
			) : (
				<div className='bg-bg-main p-5 rounded-xl flex flex-col gap-[25px]'>
					<div className='flex items-center mb-5'>
						<button className='rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white text-primary bg-highlight'>
							All Apps
						</button>
						<div className='ml-auto flex text-sm text-waiting font-medium gap-2'>
							Want to create an interesting app?
							<Link
								rel='noreferrer'
								href='/contact-us'
							>
								<div className='flex gap-1 text-primary'>
									Contact Us
									<ExternalLinkIcon />
								</div>
							</Link>
						</div>
					</div>
					<section className='grid grid-cols-4 gap-5 max-sm:hidden'>
						{currentApps.map((app) => (
							<AppCard
								className='col-span-1'
								logoComponent={app.logoComponent}
								logoUrl={app.logoUrl}
								appUrl={app.appUrl}
								key={app.name}
								name={app.name}
								description={app.description}
								newTab={app.newTab}
								modal={app.modal}
								modalComponent={app.modalComponent}
							/>
						))}
					</section>
					<section className='flex flex-wrap gap-5 sm:hidden'>
						{currentApps.map((app) => (
							<AppCard
								className='col-span-1'
								logoComponent={app.logoComponent}
								logoUrl={app.logoUrl}
								appUrl={app.appUrl}
								key={app.name}
								name={app.name}
								description={app.description}
								newTab={app.newTab}
								modal={app.modal}
								modalComponent={app.modalComponent}
							/>
						))}
					</section>
				</div>
			)}
			{userAddress && (
				<div className='mt-[30px] flex gap-x-[30px]'>
					{/* {activeMultisig && (
						<section className='w-full'>
							<Details />
						</section>
					)} */}
					<section className='w-full max-w-[50%] max-sm:max-w-full'>
						<Feedback />
					</section>
				</div>
			)}
		</div>
	);
};
export default AllApps;
