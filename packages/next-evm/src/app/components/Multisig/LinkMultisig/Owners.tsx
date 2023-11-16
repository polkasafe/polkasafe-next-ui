// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import React from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { CheckOutlined, CopyIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';
import { chainProperties } from '@next-common/global/evm-network-constants';

// import Loader from '../../UserFlow/Loader';

interface ISignatory {
	name: string;
	address: string;
}

interface Props {
	setSignatoriesWithName: React.Dispatch<React.SetStateAction<ISignatory[]>>;
	signatoriesArray: ISignatory[];
}

const Owners = ({ setSignatoriesWithName, signatoriesArray }: Props) => {
	const { network } = useGlobalApiContext();

	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className='flex justify-around items-center mb-10 w-full'>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>
							<CheckOutlined />
						</div>
						<p>Select Network</p>
					</div>
					{/* <Loader className='bg-primary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>
							<CheckOutlined />
						</div>
						<p>Name & Address</p>
					</div>
					{/* <Loader className='bg-primary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div className='px-4 overflow-auto w-full'>
					<Form className='my-0 mt-5'>
						<>
							<p className='text-text_secondary mb-3'>
								This safe on <span className='text-white capitalize'>{network}</span> has {signatoriesArray?.length}{' '}
								owners. Optional: Provide a name for each owner.
							</p>
							{signatoriesArray?.map((item, i: number) => (
								<div
									className='flex flex-col gap-y-3 mb-5'
									key={i}
								>
									<label
										className='text-primary text-xs leading-[13px] font-normal'
										htmlFor='name1'
									>
										Owner Name {i + 1}
									</label>
									<div className='flex items-center'>
										<Input
											placeholder='John Doe'
											className='lg:w-[20vw] md:w-[25vw] text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white'
											id='name'
											value={item.name}
											onChange={(e) => {
												const copyArray = [...signatoriesArray];
												const copyObject = { ...copyArray[i] };
												copyObject.name = e.target.value;
												copyArray[i] = copyObject;
												setSignatoriesWithName(copyArray);
											}}
											defaultValue={item.name}
										/>
										<div className='flex ml-3 gap-x-1'>
											<MetaMaskAvatar
												address={item.address}
												size={20}
											/>
											<div className='text-white'>{shortenAddress(item.address)}</div>
											<button onClick={() => copyText(item.address)}>
												<CopyIcon className='text-text_secondary hover:text-primary' />
											</button>
											<a
												href={`${chainProperties[network].blockExplorer}/address/${item.address}`}
												target='_blank'
												rel='noreferrer'
											>
												<ExternalLinkIcon className='text-text_secondary hover:text-primary' />
											</a>
										</div>
									</div>
								</div>
							))}
						</>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default Owners;
