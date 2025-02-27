// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import { Badge, Tooltip, Form, Divider } from 'antd';
import React, { useEffect, useState } from 'react';

import { IAddressBook } from '@common/types/substrate';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import getEncodedAddress from '@common/utils/getEncodedAddress';
import getSubstrateAddress from '@common/utils/getSubstrateAddress';
import shortenAddress from '@common/utils/shortenAddress';
import Input from '@common/global-ui-components/Input';
import { SearchIcon } from '@common/global-ui-components/Icons';
import Button, { EButtonVariant } from '@common/global-ui-components/Button';
import { getEvmAddress } from '@common/utils/getEvmAddresses';
import { DEFAULT_ADDRESS_NAME } from '@common/constants/defaults';

interface ISignature {
	name: string;
	address: string;
	key: number;
}

interface ISignatoryProps {
	setSignatories: React.Dispatch<React.SetStateAction<string[]>>;
	signatories: string[];
	// filterAddress?: string;
	homepage?: boolean;
	network: string;
	userAddress: string;
	addressBook?: IAddressBook[];
}

const SelectSignatories = ({
	// filterAddress,
	setSignatories,
	signatories,
	homepage,
	network,
	userAddress,
	addressBook
}: ISignatoryProps) => {
	const [walletAccounts, setWalletAccounts] = useState<InjectedAccount[]>([]);

	const [addAddress, setAddAddress] = useState<string>('');

	const [addresses, setAddresses] = useState<ISignature[]>(
		addressBook?.map((item, i) => ({
			address: item.address,
			key: signatories.length + i,
			name: item.name
		})) || []
	);

	const dragStart = (event: any) => {
		event.dataTransfer.setData('text', event.target.id);
	};

	const dragOver = (event: any) => {
		event.preventDefault();
	};

	const fetchWalletAccounts = async () => {
		if (addresses && addresses.length > 0) return;
		const subwallet = (window as any).SubWallet;
		const talisman = (window as any).talismanEth;

		if (!subwallet && !talisman) return;
		const accounts = await getEvmAddress(subwallet);
		const talismanAccounts = await getEvmAddress(talisman);
		const allAccounts = [...accounts, ...talismanAccounts];

		if (allAccounts && allAccounts.length > 0) {
			setWalletAccounts(allAccounts.map((account) => ({ address: account, name: DEFAULT_ADDRESS_NAME })));
		}
	};

	useEffect(() => {
		fetchWalletAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const drop = (event: any) => {
		event.preventDefault();
		const data = event.dataTransfer.getData('text');
		const address = `${data}`.split('-')[1];

		if (!address) return; // is invalid

		setSignatories((prevState) => {
			if (prevState.includes(address)) {
				return prevState;
			}

			return [...prevState, address];
		});

		// const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		// if (data) {
		// drop2?.appendChild(document.getElementById(data)!);
		// }
	};

	const dropReturn = (event: any) => {
		event.preventDefault();
		const data = event.dataTransfer.getData('text');
		const address = `${data}`.split('-')[1];

		if (!address) return; // is invalid

		if (signatories.includes(address)) {
			setSignatories((prevState) => {
				const copyState = [...prevState];
				const index = copyState.indexOf(address);
				copyState.splice(index, 1);
				return copyState;
			});
		}
		// const drop1 = document.getElementById(`drop1${homepage && '-home'}`);
		// if (data) {
		// drop1?.appendChild(document.getElementById(data)!);
		// }
	};

	const clickDropReturn = (event: any) => {
		event.preventDefault();
		const data = event.target.id;
		const address = `${data}`.split('-')[1];

		if (!address) return; // is invalid

		if (signatories.includes(address)) {
			setSignatories((prevState) => {
				const copyState = [...prevState];
				const index = copyState.indexOf(address);
				copyState.splice(index, 1);
				return copyState;
			});
		}
		// const drop1 = document.getElementById(`drop1${homepage && '-home'}`);
		// if (data) {
		// drop1?.appendChild(document.getElementById(data)!);
		// }
	};

	const clickDrop = async (event: any) => {
		event.preventDefault();
		const data = event.target.id;
		const address = `${data}`.split('-')[1];

		if (!address) return; // is invalid

		setSignatories((prevState) => {
			if (prevState.includes(address)) {
				return prevState;
			}

			return [...prevState, address];
		});

		// const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		// if (data) {
		// drop2?.appendChild(document.getElementById(data)!);
		// }
	};

	return (
		<div className='w-full max-sm:w-full'>
			{/* <NewUserModal
				open={addWalletAddress}
				onCancel={() => setAddWalletAddress(false)}
			/> */}
			<div className=''>
				<h1 className='text-label mt-3 mb-2 max-sm:text-xs'>Add Addresses</h1>
				<div className='flex items-start gap-x-3'>
					<Form.Item
						validateStatus={
							addAddress && (!getSubstrateAddress(addAddress) || signatories.includes(addAddress)) ? 'error' : ''
						}
						help={addAddress && !getSubstrateAddress(addAddress) && 'Enter a valid Address.'}
						className='w-full'
					>
						<Input
							// placeholder='Enter name, address or account index to add as signatory'
							prefix={<SearchIcon className='text-label' />}
							className='border border-label p-2'
							value={addAddress}
							onChange={(e) => setAddAddress(e.target.value)}
						/>
					</Form.Item>
					<Button
						variant={EButtonVariant.SECONDARY}
						disabled={
							!addAddress ||
							!getSubstrateAddress(addAddress) ||
							signatories.includes(addAddress) ||
							addresses.some((item) => getSubstrateAddress(addAddress) === getSubstrateAddress(item.address))
						}
						onClick={() => {
							if (!signatories.includes(addAddress) && getSubstrateAddress(addAddress)) {
								setSignatories((prev) => [...prev, addAddress]);
								setAddresses((prev) => [{ address: addAddress, name: '', key: prev.length + 1 }, ...prev]);
								setAddAddress('');
							}
						}}
					>
						<p className='font-normal text-sm'>Add</p>
					</Button>
				</div>
			</div>
			<div className='flex w-full items-center justify-center'>
				<div
					id='div1'
					className='flex flex-col my-2 w-1/2 mr-1'
					onDrop={dropReturn}
					onDragOver={dragOver}
				>
					<h1 className='text-label mb-2 max-sm:text-xs'>Available Signatories</h1>
					<div
						id={`drop1${homepage && '-home'}`}
						className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-y-auto max-sm:p-1'
					>
						{addresses && addresses.length > 0 && (
							<>
								{addresses
									.filter((item) => !signatories.includes(item.address))
									.map((address, i) => {
										return (
											// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
											<>
												<p
													onClick={clickDrop}
													title={address.address || ''}
													id={`${address.key}-${address.address}`}
													key={`${address.key}-${address.address}`}
													className='bg-bg-main p-2 m-1 cursor-grab rounded-md text-white flex items-center gap-x-2 max-sm:text-[8px]'
													draggable
													onDragStart={dragStart}
												>
													{address.name ? address.name : null} (
													{shortenAddress(getEncodedAddress(address.address, network) || address.address)})
												</p>
												{i === addresses.length - 1 && (
													<Divider
														variant='solid'
														className='border-text-disabled my-1'
													/>
												)}
											</>
										);
									})}
							</>
						)}
						{
							<>
								<div className='text-sm text-text-disabled'>Addresses imported directly from your wallet</div>
								{walletAccounts
									.filter((item) => !signatories.includes(item.address))
									.map((account, i) => (
										// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
										<p
											onClick={clickDrop}
											title={account.address || ''}
											id={`${i + 1 + addresses.length}-${account.address}`}
											key={`${i + 1 + addresses.length}-${account.address}`}
											className='bg-bg-main cursor-grab p-2 m-1 rounded-md text-white'
											draggable
											onDragStart={dragStart}
										>
											{account.name ? account.name : null} (
											{shortenAddress(getEncodedAddress(account.address, network) || account.address)})
										</p>
									))}
							</>
						}
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div
					id='div2'
					className='flex flex-col my-2 pd-2 w-1/2 ml-2'
				>
					<h1 className='text-label mb-2 max-sm:text-xs'>Selected Signatories</h1>
					<div
						id={`drop2${homepage && '-home'}`}
						className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto max-sm:p-1'
						onDrop={drop}
						onDragOver={dragOver}
					>
						{signatories.map((a, i) => (
							<p
								onClick={a !== userAddress ? clickDropReturn : () => {}}
								title={a || ''}
								id={`${i}-${a}`}
								key={`${i}-${a}`}
								className='bg-bg-main p-2 m-1 rounded-md text-white cursor-grab flex items-center gap-x-2 max-sm:text-[8px]'
							>
								{addressBook?.find((item) => getSubstrateAddress(item.address) === getSubstrateAddress(a))?.name ||
									walletAccounts?.find((item) => getSubstrateAddress(item.address) === getSubstrateAddress(a))?.name ||
									null}{' '}
								({shortenAddress(getEncodedAddress(a, network) || a)})
								{getSubstrateAddress(a) === getSubstrateAddress(userAddress) && (
									<Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}>
										<Badge status='success' />
									</Tooltip>
								)}
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SelectSignatories;
