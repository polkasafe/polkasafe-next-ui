// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dropdown, Form, Input } from 'antd';
import React from 'react';
import { ParachainIcon } from '@next-evm/app/components/NetworksDropdown/NetworkCard';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { IAsset } from '@next-common/types';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';

interface Props {
	className?: string;
	label?: string;
	onChange: (balance: string) => void;
	placeholder?: string;
	defaultValue?: string;
	token?: IAsset;
	onTokenChange?: (token: IAsset) => void;
}

const BalanceInput = ({
	className,
	label = '',
	onChange,
	placeholder = '',
	defaultValue = '',
	token,
	onTokenChange
}: Props) => {
	const { network } = useGlobalApiContext();

	const { allAssets } = useMultisigAssetsContext();

	const tokenOptions: ItemType[] = allAssets?.map((item) => ({
		key: item.name,
		label: (
			<span className='flex items-center gap-x-2 text-white'>
				<ParachainIcon
					size={15}
					src={item.logoURI}
				/>
				{item.name}
			</span>
		) as any
	}));

	const onTokenOptionChange = (e: any) => {
		const selectedToken = allAssets?.find((item) => item.name === e.key);
		if (selectedToken) onTokenChange?.(selectedToken);
	};

	return (
		<section className={`${className}`}>
			<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>{label}</label>
			<div className='flex items-center gap-x-[10px]'>
				<article className='w-full'>
					<Form.Item
						className='border-0 outline-0 my-0 p-0'
						name='balance'
						rules={[{ required: true }]}
					>
						<div className='flex items-center h-[50px]'>
							<Input
								id='balance'
								onChange={(e) =>
									onChange(Number.isNaN(e.target.value) || !e.target.value.trim() ? '0' : e.target.value.trim())
								}
								placeholder={`${placeholder} ${token?.name || chainProperties[network].tokenSymbol}`}
								defaultValue={defaultValue}
								className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24'
							/>
							{allAssets?.length > 0 && token ? (
								<Dropdown
									trigger={['click']}
									className={className}
									menu={{
										items: tokenOptions,
										onClick: onTokenOptionChange
									}}
								>
									<div className='absolute right-0 flex cursor-pointer gap-x-1 items-center justify-center pr-3 text-white'>
										<ParachainIcon
											src={token?.logoURI}
											size={15}
										/>
										<span>{token?.name}</span>
										<CircleArrowDownIcon className='text-primary' />
									</div>
								</Dropdown>
							) : (
								<div className='absolute right-0 text-white px-3 flex gap-x-1 items-center justify-center'>
									<ParachainIcon
										src={chainProperties[network].logo}
										size={15}
									/>
									<span>{chainProperties[network].tokenSymbol}</span>
								</div>
							)}
						</div>
					</Form.Item>
				</article>
			</div>
		</section>
	);
};

export default BalanceInput;
