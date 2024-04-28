// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown, Form } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import React, { useState } from 'react';
import { currencies, currencyProperties } from '@next-common/global/currencyConstants';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';

import Image from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import ModalBtn from '../Multisig/ModalBtn';

export const CurrencyFlag = ({ src, className }: { src: string; className?: string }) => {
	return (
		<Image
			className={`${className} block rounded-sm`}
			height={10}
			width={20}
			src={src}
			alt='Currency Flag'
		/>
	);
};

const ChangeCurrency = ({
	className,
	currency,
	setCurrency,
	small
}: {
	className?: string;
	currency?: string;
	setCurrency?: React.Dispatch<React.SetStateAction<string>>;
	small?: boolean;
}) => {
	const [openCurrencyChangedModal, setOpenCurrencyChangedModal] = useState<boolean>(false);
	const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useGlobalCurrencyContext();

	const currencyOptions: ItemType[] = Object.values(currencies).map((c) => ({
		key: c,
		label: (
			<span className='text-white flex items-center gap-x-2'>
				<CurrencyFlag src={currencyProperties[c]?.logo} />
				{small ? currencyProperties[c].symbol : `${c} (${currencyProperties[c].symbol})`}
			</span>
		)
	}));

	const onCurrencyChange = (e: any) => {
		if (setCurrency) {
			setCurrency(e.key);
		} else {
			setGlobalCurrency(e.key);
			if (!small) {
				setOpenCurrencyChangedModal(true);
			}
			if (typeof window !== 'undefined') {
				localStorage.setItem('currency', e.key);
			}
		}
	};

	return (
		<div className={className}>
			<ModalComponent
				onCancel={() => setOpenCurrencyChangedModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Currency Changed</h3>}
				open={openCurrencyChangedModal}
			>
				<Form className='my-0 w-[560px]'>
					<p className='text-white font-medium text-sm leading-[15px]'>
						Your default Currency has been changed to {currencyProperties[globalCurrency].symbol}
					</p>
					<div className='flex items-center justify-center gap-x-5 mt-[30px]'>
						<ModalBtn
							title='Close'
							onClick={() => setOpenCurrencyChangedModal(false)}
						/>
					</div>
				</Form>
			</ModalComponent>
			<Dropdown
				trigger={['click']}
				className={`${
					small ? 'bg-transparent' : 'border border-primary rounded-lg p-2.5 bg-bg-secondary'
				} cursor-pointer ${className}`}
				menu={{
					items: currencyOptions,
					onClick: onCurrencyChange
				}}
			>
				<div
					className={`flex justify-between gap-x-4 items-center ${small ? 'text-primary' : 'text-white'} text-[16px]`}
				>
					<span className='flex items-center gap-x-2'>
						<CurrencyFlag src={currencyProperties[currency || globalCurrency]?.logo} />
						{small
							? currencyProperties[currency || globalCurrency].symbol
							: `${currency || globalCurrency} (${currencyProperties[currency || globalCurrency].symbol})`}
					</span>
					<CircleArrowDownIcon className='text-primary' />
				</div>
			</Dropdown>
		</div>
	);
};

export default ChangeCurrency;
