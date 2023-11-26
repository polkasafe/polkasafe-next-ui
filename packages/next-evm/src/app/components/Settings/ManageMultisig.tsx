// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Details from '@next-evm/app/components/Settings/Details';
import Feedback from '@next-evm/app/components/Settings/Feedback';
import AddNewOwnerBtn from '@next-evm/app/components/Settings/Owners/AddBtn';
import ListOwners from '@next-evm/app/components/Settings/Owners/List';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { chainProperties } from '@next-common/global/evm-network-constants';
import ChangeCurrency from '../Assets/ChangeCurrency';

const ManageMultisig = () => {
	const { multisigAddresses, activeMultisig, address: userAddress } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const multisig = multisigAddresses.find((item: any) => item.address === activeMultisig);

	return (
		<div>
			{!multisigAddresses || !multisig ? (
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>
						Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.
					</p>
				</section>
			) : (
				<>
					<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>Manage Safe Owners</h2>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
						<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
							<div className='bg-bg-secondary rounded-lg p-3 w-auto flex items-center gap-x-4'>
								<div className='flex flex-col items-start'>
									<div className='px-2 mb-1 py-[2px] rounded-md text-xs font-medium bg-primary text-white'>
										Multisig
									</div>
									<div className='flex items-center text-text_secondary'>
										{shortenAddress(multisig?.address || '', 10)}
										<button
											className='ml-2 mr-1'
											onClick={() => copyText(multisig?.address)}
										>
											<CopyIcon />
										</button>
										<a
											href={`${chainProperties[network].blockExplorer}/address/${multisig?.address}`}
											target='_blank'
											rel='noreferrer'
										>
											<ExternalLinkIcon />
										</a>
									</div>
								</div>
							</div>
							<AddNewOwnerBtn disabled={false} />
						</section>
						<section>
							<ListOwners />
						</section>
					</div>
				</>
			)}
			{userAddress && (
				<div className='mt-[30px] flex gap-x-[30px]'>
					{multisigAddresses && activeMultisig && multisig && (
						<section className='w-full'>
							<Details />
						</section>
					)}
					<section className='w-full max-w-[50%]'>
						<Feedback />
					</section>
				</div>
			)}
			<div className='mt-[30px] flex gap-x-[30px]'>
				<ChangeCurrency />
			</div>
		</div>
	);
};

export default ManageMultisig;
