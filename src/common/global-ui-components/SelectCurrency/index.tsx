'use client';

import { Dropdown } from 'antd';
import { twMerge } from 'tailwind-merge';
import { allCurrencies, currencySymbol } from '@common/constants/currencyConstants';
import Image, { StaticImageData } from 'next/image';
import { useCurrency } from '@substrate/app/atoms/currency/currencyAtom';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import { ItemType } from 'antd/es/menu/interface';

export const CurrencyFlag = ({ src, className }: { src: string | StaticImageData; className?: string }) => {
	return (
		<Image
			className={twMerge('block rounded-sm', className)}
			height={10}
			width={20}
			src={src}
			alt='Currency Flag'
		/>
	);
};

interface ISelectCurrencyProps {
	transparent?: boolean;
	classNames?: string;
}

function SelectCurrency({ transparent, classNames }: ISelectCurrencyProps) {
	const [selectedCurrency, setSelectedCurrency] = useCurrency();

	const currencyOptions: ItemType[] = Object.values(currencySymbol).map((c) => ({
		key: c,
		label: (
			<span className='text-white flex items-center gap-x-2'>
				<CurrencyFlag src={allCurrencies[c]?.logo} />
				{c}
			</span>
		)
	}));

	const onCurrencyChange = (e: any) => {
		setSelectedCurrency(e.key);
		if (typeof window !== 'undefined') {
			localStorage.setItem('currency', e.key);
		}
	};

	return (
		<Dropdown
			trigger={['click']}
			className={twMerge(
				'cursor-pointer',
				transparent && 'bg-transparent',
				!transparent && 'border border-primary rounded-lg p-2.5 bg-bg-secondary',
				classNames
			)}
			menu={{
				items: currencyOptions,
				onClick: onCurrencyChange
			}}
		>
			<div
				className={twMerge(
					'flex justify-between gap-x-4 items-center',
					transparent && 'text-primary',
					!transparent && 'text-white'
				)}
			>
				<span className='flex items-center gap-x-2'>
					<CurrencyFlag src={allCurrencies[selectedCurrency]?.logo} />
					{selectedCurrency}
				</span>
				<CircleArrowDownIcon className='text-primary' />
			</div>
		</Dropdown>
	);
}

export default SelectCurrency;
