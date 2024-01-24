// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { INFTAsset } from '@next-common/types';
import { CircleArrowDownIcon, OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import isValidWeb3Address from '@next-evm/utils/isValidWeb3Address';
import { AutoComplete, Dropdown, Form } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const SendNFT = ({
	className,
	setNftRecipient,
	multisigAddress,
	setSelectedNft,
	selectedNft
}: {
	className?: string;
	multisigAddress: string;
	setSelectedNft: React.Dispatch<React.SetStateAction<INFTAsset>>;
	setNftRecipient: React.Dispatch<React.SetStateAction<string>>;
	selectedNft: INFTAsset;
}) => {
	const { address: userAddress } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();
	const { allNfts } = useMultisigAssetsContext();
	const [address, setAddress] = useState<string>(userAddress);
	const [validAddress, setValidAddress] = useState<boolean>(true);

	console.log('nfts', allNfts[multisigAddress]);

	const nfts: ItemType[] = allNfts[multisigAddress]?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<span className='text-white text-sm flex items-center gap-x-2'>
				<Image
					height={40}
					width={40}
					className='rounded-md'
					src={item.imageUri}
					alt={item.tokenNameWithID}
				/>
				<p>{item.tokenNameWithID}</p>
			</span>
		)
	}));

	const [autocompleteAddresses, setAutoCompleteAddresses] = useState<DefaultOptionType[]>([]);
	useEffect(() => {
		if (!address) return;
		if (!isValidWeb3Address(address)) {
			setValidAddress(false);
			return;
		}
		setNftRecipient(address);
		setValidAddress(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	// Set address options for recipient
	useEffect(() => {
		if (!activeOrg || !activeOrg.addressBook) return;

		const allAddresses: string[] = [];
		activeOrg?.addressBook.forEach((item) => {
			if (!allAddresses.includes(item.address)) {
				allAddresses.push(item.address);
			}
		});
		setAutoCompleteAddresses(
			allAddresses.map((a) => ({
				label: (
					<AddressComponent
						withBadge={false}
						address={a}
					/>
				),
				value: a
			}))
		);
	}, [activeOrg, address]);

	return (
		<div className={className}>
			<section className='w-[500px]'>
				<div>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient*</label>
					<Form.Item
						name='recipient'
						rules={[{ required: true }]}
						help={(!address && 'Recipient Address is Required') || (!validAddress && 'Please add a valid Address')}
						className='border-0 outline-0 my-0 p-0'
						validateStatus={address && validAddress ? 'success' : 'error'}
					>
						<div className='h-[50px]'>
							{address && autocompleteAddresses.some((item) => item.value && String(item.value) === address) ? (
								<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
									{autocompleteAddresses.find((item) => item.value && String(item.value) === address)?.label}
									<button
										className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
										onClick={() => {
											setAddress('');
											setNftRecipient('');
										}}
									>
										<OutlineCloseIcon className='text-primary w-2 h-2' />
									</button>
								</div>
							) : (
								<AutoComplete
									autoFocus
									filterOption={(inputValue, options) => {
										return inputValue && options?.value ? String(options?.value) === inputValue : true;
									}}
									options={autocompleteAddresses}
									id='recipient'
									placeholder='Send to Address..'
									onChange={(value) => setAddress(value)}
									value={address}
									defaultValue={address || ''}
								/>
							)}
						</div>
					</Form.Item>
				</div>
			</section>
			<section className='w-[500px]'>
				<div>
					<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px] py-2'>NFT</label>
					{allNfts[multisigAddress] && allNfts[multisigAddress]?.length > 0 ? (
						<Dropdown
							trigger={['click']}
							className={`border border-primary rounded-lg p-3 bg-bg-secondary cursor-pointer ${className}`}
							menu={{
								items: nfts,
								onClick: (e) => {
									const selected = JSON.parse(e.key) as INFTAsset;
									setSelectedNft(selected);
								}
							}}
						>
							<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
								<span className='flex items-center gap-x-2 text-sm'>
									<Image
										height={40}
										width={40}
										className='rounded-md'
										src={selectedNft?.imageUri}
										alt={selectedNft?.tokenNameWithID}
									/>
									<p>{selectedNft?.tokenNameWithID}</p>
								</span>
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					) : (
						<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
							<p className='text-white'>Your Safe has no NFT, please add one to use this Feature</p>
						</section>
					)}
				</div>
			</section>
		</div>
	);
};

export default SendNFT;
