// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { MenuProps } from 'antd';
import { Divider, Dropdown, Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import LoadingLottie from '@next-common/assets/lottie-graphics/Loading';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { CheckOutlined, CircleArrowDownIcon, WarningCircleIcon } from '@next-common/ui-components/CustomIcons';
import Address from '@next-evm/ui-components/Address';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { NETWORK } from '@next-common/global/evm-network-constants';

// import Loader from '@next-evm/app/components/UserFlow/Loader';

interface Props {
	className?: string;
	setMultisigAddress: React.Dispatch<React.SetStateAction<string>>;
	multisigName: string;
	setMultisigName: React.Dispatch<React.SetStateAction<string>>;
	network: NETWORK;
}

const NameAddress = ({ className, setMultisigAddress, multisigName, setMultisigName, network }: Props) => {
	const { address, gnosisSafe } = useGlobalUserDetailsContext();
	const { multisigSettings } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const [allSafes, setAllSafes] = useState<Array<{ address: string }>>([]);
	const [selectedAddress, setSelectedAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const multisigAddresses = activeOrg?.multisigs || [];
	const multisigs = multisigAddresses
		.filter((multisig) => multisig.network === network && !multisigSettings?.[`${multisig.address}`]?.deleted)
		.map((item) => item.address);

	useEffect(() => {
		if (!gnosisSafe) {
			return;
		}
		const getAllSafes = async () => {
			setLoading(true);
			const safes = await gnosisSafe.getAllSafesByOwner(address);
			const filteredSafes = safes?.safes.filter((item: any) => !multisigs.includes(item)) || [];
			setMultisigAddress(filteredSafes[0]);
			if (filteredSafes?.length > 0) {
				setAllSafes(filteredSafes.map((a) => ({ address: a })));
				setSelectedAddress(filteredSafes[0]);
			}
			setLoading(false);
		};
		getAllSafes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, multisigAddresses, gnosisSafe]);

	const dropdownItems: MenuProps['items'] = [
		...allSafes.map((account, i) => ({
			key: account.address,
			label: (
				<div>
					<Address
						disableExtensionName
						shortenAddressLength={0}
						className='text-white mb-1'
						address={account.address}
					/>
					{i === allSafes.length - 1 && multisigs.length !== 0 && <Divider className='bg-text_secondary my-1' />}
				</div>
			)
		})),
		...multisigs.map((a) => ({
			disabled: true,
			key: a,
			label: (
				<div className='flex justify-between items-center'>
					<Address
						disableExtensionName
						shortenAddressLength={0}
						address={a}
					/>
					<span className='text-success flex gap-x-1'>
						<CheckOutlined /> Linked
					</span>
				</div>
			)
		}))
	];

	return (
		<div className={className}>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className='flex justify-around items-center mb-10 w-full'>
					<div className='flex flex-col items-center text-white justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>
							<CheckOutlined />
						</div>
						<p>Select Network</p>
					</div>
					{/* <Loader className='bg-primary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Name & Address</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					{/* <Loader className='bg-bg-secondary h-[2px] w-[80px]' /> */}
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					{loading ? (
						<LoadingLottie
							message='Fetching Your Multisigs'
							width={250}
						/>
					) : allSafes.length === 0 ? (
						<div className='flex flex-col items-center'>
							<section className='mb-4 text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px] border border-waiting'>
								<span>
									<WarningCircleIcon className='text-base' />
								</span>
								<p>Looks like you don&apos;t have any Safe to link.</p>
							</section>
							{multisigs.length > 0 && (
								<div className='bg-bg-secondary w-[500px] text-text_secondary rounded-lg p-3 flex flex-col gap-y-3 max-h-[250px] overflow-y-auto'>
									{multisigs.map((a) => (
										<div
											key={a}
											className='flex justify-between items-center pointer-events-none'
										>
											<Address
												disableExtensionName
												shortenAddressLength={0}
												address={a}
											/>
											<span className='text-success flex gap-x-1'>
												<CheckOutlined /> Linked
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<Form className='my-0 w-[560px] mt-10'>
							<div className='flex flex-col gap-y-3'>
								<label
									className='text-primary text-xs leading-[13px] font-normal'
									htmlFor='name'
								>
									Safe Name
								</label>
								<Form.Item
									name='name'
									rules={[]}
									className='border-0 outline-0 my-0 p-0'
								>
									<Input
										placeholder='my-polka-safe'
										className='text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 text-white placeholder:text-[#505050] bg-bg-secondary rounded-lg'
										id='name'
										value={multisigName}
										onChange={(e) => setMultisigName(e.target.value)}
									/>
								</Form.Item>
							</div>
							<div className='flex flex-col gap-y-3 mt-5'>
								<label
									className='text-primary text-xs leading-[13px] font-normal'
									htmlFor='address'
								>
									Safe Address*
								</label>
								<Dropdown
									trigger={['click']}
									className={`border border-primary rounded-xl px-3 py-[13px] bg-bg-secondary cursor-pointer ${className}`}
									menu={{
										items: dropdownItems,
										onClick: (e) => {
											setSelectedAddress(e.key);
											setMultisigAddress(e.key);
										}
									}}
								>
									<div className='flex justify-between items-center '>
										<Address
											className='text-white'
											disableExtensionName
											shortenAddressLength={0}
											address={selectedAddress}
										/>
										<CircleArrowDownIcon className='text-primary text-base' />
									</div>
								</Dropdown>
							</div>
						</Form>
					)}
				</div>
			</div>
		</div>
	);
};

export default NameAddress;
