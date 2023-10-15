// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useActiveMultisigContext } from '@next-substrate/context/ActiveMultisigContext';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from '@next-common/global/default';
import { chainProperties } from '@next-common/global/networkConstants';
import useGetWalletAccounts from '@next-substrate/hooks/useGetWalletAccounts';
import { WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import inputToBn from '@next-substrate/utils/inputToBn';

import NewUserModal from '../Home/ConnectWallet/NewUserModal';

interface ISignature {
	name: string;
	address: string;
	key: number;
	balance?: string;
}

interface ISignatoryProps {
	setSignatories: React.Dispatch<React.SetStateAction<string[]>>;
	signatories: string[];
	filterAddress?: string;
	homepage: boolean;
}

const Signatory = ({ filterAddress, setSignatories, signatories, homepage }: ISignatoryProps) => {
	const { address: userAddress, addressBook } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const { accounts } = useGetWalletAccounts();

	const [addWalletAddress, setAddWalletAddress] = useState<boolean>(false);

	const [addresses, setAddresses] = useState<ISignature[]>([]);
	const [filteredAddresses, setFilteredAddresses] = useState<ISignature[]>([]);

	useEffect(() => {
		const allAddresses: ISignature[] = [];
		if (records) {
			Object.keys(records).forEach((address, i) => {
				const personal = addressBook.find((item) => getSubstrateAddress(item.address) === getSubstrateAddress(address));
				if (address !== getSubstrateAddress(userAddress)) {
					allAddresses.push({
						address: getEncodedAddress(address, network) || address,
						key: i,
						name: personal?.nickName || records[address]?.name || personal?.name || DEFAULT_ADDRESS_NAME
					});
				}
			});
		}
		addressBook
			.filter(
				(item) =>
					getSubstrateAddress(item.address) !== getSubstrateAddress(userAddress) &&
					!allAddresses.some((a) => getSubstrateAddress(a.address) === getSubstrateAddress(item.address))
			)
			.forEach((item, i) => {
				allAddresses.push({
					address: getEncodedAddress(item.address, network) || item.address,
					key: i,
					name: item.nickName || item.name
				});
			});

		setAddresses(allAddresses);
		setFilteredAddresses(allAddresses);
	}, [addressBook, network, records, userAddress]);

	useEffect(() => {
		if (!addresses) {
			return;
		}
		setFilteredAddresses(
			addresses.filter((item) =>
				filterAddress
					? item.address.includes(getEncodedAddress(filterAddress, network) || filterAddress, 0) ||
					  item.name.includes(filterAddress, 0)
					: true
			)
		);
	}, [addresses, filterAddress, network]);

	useEffect(() => {
		if (!api || !apiReady || !addresses) {
			return;
		}
		const fetchBalances = async () => {
			const results = await Promise.allSettled(addresses.map((item) => api.query.system.account(item.address)));
			results.forEach((result, i) => {
				if (result.status === 'fulfilled') {
					const balance = result.value;
					setAddresses((prev) => {
						const copyPrev = [...prev];
						const copyObj = copyPrev[i];
						if (copyObj) {
							copyObj.balance = balance?.data?.free?.toString();
						}
						return copyPrev;
					});
				}
			});
		};
		fetchBalances();
	}, [api, apiReady, addressBook, addresses]);

	const dragStart = (event: any) => {
		event.dataTransfer.setData('text', event.target.id);
	};

	const dragOver = (event: any) => {
		event.preventDefault();
	};

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

		const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		if (data) {
			drop2?.appendChild(document.getElementById(data)!);
		}
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
		const drop1 = document.getElementById(`drop1${homepage && '-home'}`);
		if (data) {
			drop1?.appendChild(document.getElementById(data)!);
		}
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
		const drop1 = document.getElementById(`drop1${homepage && '-home'}`);
		if (data) {
			drop1?.appendChild(document.getElementById(data)!);
		}
	};

	const clickDrop = async (event: any) => {
		event.preventDefault();
		const data = event.target.id;
		const address = `${data}`.split('-')[1];

		if (!address || !api || !apiReady) return; // is invalid

		setSignatories((prevState) => {
			if (prevState.includes(address)) {
				return prevState;
			}

			return [...prevState, address];
		});

		const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		if (data) {
			drop2?.appendChild(document.getElementById(data)!);
		}
	};

	return (
		<div className='flex w-[45vw]'>
			<NewUserModal
				open={addWalletAddress}
				onCancel={() => setAddWalletAddress(false)}
			/>
			<div className='flex w-[100%] items-center justify-center'>
				<div
					id='div1'
					className='flex flex-col my-2 w-1/2 mr-1 cursor-grab'
					onDrop={dropReturn}
					onDragOver={dragOver}
				>
					<h1 className='text-primary mt-3 mb-2'>Available Signatory</h1>
					<div
						id={`drop1${homepage && '-home'}`}
						className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-y-auto'
					>
						{filteredAddresses.length > 0 ? (
							filteredAddresses.map((address) => {
								const lowBalance =
									address.balance &&
									(Number(address.balance) <
										Number(inputToBn(`${chainProperties[network].existentialDeposit}`, network)[0]) ||
										Number(address.balance) === 0);
								return (
									// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
									<p
										onClick={signatories.includes(address.address) ? clickDropReturn : clickDrop}
										title={getEncodedAddress(address.address, network) || ''}
										id={`${address.key}-${address.address}`}
										key={`${address.key}-${address.address}`}
										className='bg-bg-main p-2 m-1 rounded-md text-white flex items-center gap-x-2'
										draggable
										onDragStart={dragStart}
									>
										{address.name}
										{lowBalance && signatories.includes(address.address) && (
											<Tooltip
												title={
													<div className='text-text_secondary text-xs'>
														<div className='text-bold text-sm text-white mb-3'>Insufficient Balance</div>
														<div>
															This account does not have sufficient balance in their account to sign the transaction for
															creation of proxy
														</div>
														{/* <div className='mt-2 text-primary'><a href='https://polkadot.js.org/apps/#/accounts' target='_blank' rel="noreferrer">Send Funds</a></div> */}
													</div>
												}
											>
												<WarningCircleIcon className='text-base' />
											</Tooltip>
										)}
									</p>
								);
							})
						) : (
							// <Tooltip title='Import Addresses From Your Wallet.'>
							// <Button onClick={() => setAddWalletAddress(true)} className='bg-primary flex items-center justify-center border-none outline-none text-white w-full' icon={<AddIcon/>}>
							// Import
							// </Button>
							// </Tooltip>
							<>
								<div className='text-sm text-text_secondary'>
									Addresses imported directly from your Polkadot.js wallet
								</div>
								{accounts
									.filter((item) => item.address !== getEncodedAddress(userAddress, network))
									.map((account, i) => (
										// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
										<p
											onClick={signatories.includes(account.address) ? clickDropReturn : clickDrop}
											title={getEncodedAddress(account.address, network) || ''}
											id={`${i + 1}-${account.address}`}
											key={`${i + 1}-${account.address}`}
											className='bg-bg-main p-2 m-1 rounded-md text-white'
											draggable
											onDragStart={dragStart}
										>
											{account.name}
										</p>
									))}
							</>
						)}
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div
					id='div2'
					className='flex flex-col my-2 pd-2 w-1/2 ml-2'
				>
					<h1 className='text-primary mt-3 mb-2'>Selected Signatory</h1>
					<div
						id={`drop2${homepage && '-home'}`}
						className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto cursor-grab'
						onDrop={drop}
						onDragOver={dragOver}
					>
						<p
							title={getEncodedAddress(userAddress, network) || ''}
							id={`0-${signatories[0]}`}
							key={`0-${signatories[0]}`}
							className='bg-bg-main p-2 m-1 rounded-md text-white cursor-default flex items-center gap-x-2'
						>
							{addressBook[0]?.name}{' '}
							<Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}>
								<Badge status='success' />
							</Tooltip>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signatory;
