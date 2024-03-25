// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { AutoComplete, Dropdown, Form } from 'antd';
import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { CircleArrowDownIcon, OutlineCloseIcon } from '@next-common/ui-components/CustomIcons';
import getSubstrateAddress from '@next-substrate/utils/getSubstrateAddress';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { DefaultOptionType } from 'antd/es/select';

export enum EProxyTypes {
	Any = 'Any',
	NonTransfer = 'NonTransfer',
	Governance = 'Governance',
	Staking = 'Staking'
	// IdentityJudgement = 'IdentityJudgement',
	// CancelProxy = 'CancelProxy',
	// Auction = 'Auction',
	// NominationPools = 'NominationPools'
}

const Delegate = ({
	className,
	api,
	apiReady,
	setCallData,
	autocompleteAddresses
}: {
	className?: string;
	api: ApiPromise;
	apiReady: boolean;
	setCallData: React.Dispatch<React.SetStateAction<string>>;
	autocompleteAddresses: DefaultOptionType[];
}) => {
	const [proxyAddress, setProxyAddress] = useState<string>('');
	const [validProxyAddress, setValidProxyAddress] = useState<boolean>(true);
	const [proxytype, setProxytype] = useState<EProxyTypes>(EProxyTypes.Any);

	const proxyTypes: ItemType[] = Object.values(EProxyTypes).map((item) => ({
		key: item,
		label: <span className='text-white text-sm flex items-center gap-x-2'>{item}</span>
	}));

	useEffect(() => {
		if (getSubstrateAddress(proxyAddress)) {
			setValidProxyAddress(true);
		} else {
			setValidProxyAddress(false);
		}
	}, [proxyAddress]);

	useEffect(() => {
		if (!api || !apiReady || !proxyAddress || !proxytype || !validProxyAddress) {
			setCallData('');
			return;
		}

		const tx = api.tx.proxy.addProxy(proxyAddress, proxytype, 0);
		setCallData(tx.method.toHex());
	}, [api, apiReady, proxyAddress, proxytype, setCallData, validProxyAddress]);

	return (
		<div className={`${className}`}>
			<section className='mt-[15px]'>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<div>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Proxy Account*</label>
							<Form.Item
								name='proxy'
								rules={[{ required: true }]}
								help={
									(!proxyAddress && 'Proxy Address is Required') || (!validProxyAddress && 'Please add a valid Address')
								}
								className='border-0 outline-0 my-0 p-0'
								validateStatus={proxyAddress && validProxyAddress ? 'success' : 'error'}
							>
								<div className='h-[50px]'>
									{proxyAddress &&
									autocompleteAddresses.some(
										(item) =>
											item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(proxyAddress)
									) ? (
										<div className='border border-solid border-primary rounded-lg px-2 h-full flex justify-between items-center'>
											{
												autocompleteAddresses.find(
													(item) =>
														item.value && getSubstrateAddress(String(item.value)) === getSubstrateAddress(proxyAddress)
												)?.label
											}
											<button
												className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center z-100'
												onClick={() => {
													setProxyAddress('');
												}}
											>
												<OutlineCloseIcon className='text-primary w-2 h-2' />
											</button>
										</div>
									) : (
										<AutoComplete
											className='[&>div>span>input]:px-[12px]'
											filterOption={(inputValue, options) => {
												return inputValue && options?.value
													? getSubstrateAddress(String(options?.value) || '') === getSubstrateAddress(inputValue)
													: true;
											}}
											// notFoundContent={
											// validProxyAddress && (
											// <Button
											// icon={<PlusCircleOutlined className='text-primary' />}
											// className='bg-transparent border-none outline-none text-primary text-sm flex items-center'
											// onClick={() => setShowAddressModal(true)}
											// >
											// Add Address to Address Book
											// </Button>
											// )
											// }
											options={autocompleteAddresses}
											id='proxy'
											placeholder='Send to Address..'
											onChange={(value) => setProxyAddress(value)}
											value={proxyAddress}
										/>
									)}
								</div>
							</Form.Item>
						</div>
					</article>
				</div>
			</section>
			<section className='mt-[15px]'>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<div>
							<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Proxy Type*</label>
							<Form.Item className='border-0 outline-0 my-0 p-0'>
								<Dropdown
									trigger={['click']}
									className={`border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer ${className}`}
									menu={{
										items: proxyTypes,
										onClick: (e) => {
											setProxytype?.(e.key as EProxyTypes);
										}
									}}
								>
									<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
										<span className='flex items-center gap-x-2 text-sm'>{proxytype}</span>
										<CircleArrowDownIcon className='text-primary' />
									</div>
								</Dropdown>
							</Form.Item>
						</div>
					</article>
				</div>
			</section>
		</div>
	);
};

export default Delegate;
