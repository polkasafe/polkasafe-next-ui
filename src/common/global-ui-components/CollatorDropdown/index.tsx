// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { ItemType } from 'antd/es/menu/interface';
import { SubstrateAddress } from '../SubstrateAddress';
import { ICollator } from '@common/types/substrate';
import Typography, { ETypographyVariants } from '../Typography';
import { formatBalance } from '@common/utils/formatBalance';


interface ICollatorDropdownProps {
	defaultAddress?: string;
	accounts: Array<ICollator>;
	className?: string;
	disabled?: boolean;
	onAccountChange: (address: string) => void;
}

const CollatorDropdown = ({ defaultAddress, className, accounts, disabled, onAccountChange }: ICollatorDropdownProps) => {
	const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
	useEffect(() => {
		if (defaultAddress) {
			setSelectedAddress(defaultAddress);
		}
	}, [defaultAddress]);

	const dropdownList: { [index: string]: string } = {};
	const addressItems: ItemType[] = accounts.map((account, index) => {
		if (account.address) {
			dropdownList[account.address] = '';
		}
        const stakeAmount = formatBalance(account.stake.split(',').join(''), 18, {
            withThousandDelimitor: true,
            numberAfterComma: 2
        });
		if (index === accounts.length - 1) {
			return {
				key: account.address,
				label: (
                    <div className='flex flex-col gap-y-2'>
                        <div className='flex items-center justify-between'>
                            <Typography variant={ETypographyVariants.p}>
                                Total Staker: {account.stakers}
                            </Typography>
                            <Typography variant={ETypographyVariants.p}>
                                Stake: {stakeAmount}
                            </Typography>
                        </div>
                        <SubstrateAddress
                            extensionName={''}
                            className='text-white'
                            address={account.address}
                        />
                    </div>
				)
			};
		}
		return {
			key: account.address,
			label: (
                <div>
                    <div className='flex flex-col gap-y-2'>
                        <div className='flex items-center justify-between'>
                            <Typography variant={ETypographyVariants.p}>
                                Total Staker: {account.stakers}
                            </Typography>
                            <Typography variant={ETypographyVariants.p}>
                                Stake: {stakeAmount}
                            </Typography>
                        </div>
                        <SubstrateAddress
                            extensionName={''}
                            address={account.address}
                        />
                    </div>
                    <Divider className='border-text-secondary my-0 mt-3' />
                </div>
			)
		};
	});
	return (
		<Dropdown
			disabled={disabled}
			trigger={['click']}
			className={`border-primary bg-bg-secondary cursor-pointer rounded-xl border px-3 py-2 ${className}`}
			menu={{
				items: addressItems,
				onClick: (e) => {
					setSelectedAddress(e.key);
					onAccountChange(e.key);
				}
			}}
		>
			<div className='flex items-center justify-between'>
				<SubstrateAddress
					extensionName={dropdownList[selectedAddress]}
					address={selectedAddress}
				/>
				<CircleArrowDownIcon className='text-primary text-base' />
			</div>
		</Dropdown>
	);
};

export default CollatorDropdown;
