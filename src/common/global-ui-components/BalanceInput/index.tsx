// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Form, Input, Select } from 'antd';
import BN from 'bn.js';
import { networkConstants } from '@common/constants/substrateNetworkConstant';

import { ENetwork } from '@common/enum/substrate';
import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
import inputToBn from '@common/utils/inputToBn';
import USDTLogo from '@common/assets/token-icons/usdt-logo.png';
import USDCLogo from '@common/assets/token-icons/usdc-logo.png';
import { twMerge } from 'tailwind-merge';
import { useState, useRef, useEffect } from 'react';
import { formatBalance } from '@substrate/app/global/utils/formatBalance';

interface Props {
	className?: string;
	label?: string;
	onChange: (balance: BN, selectedCurrency?: string) => void;
	placeholder?: string;
	defaultValue?: string;
	network: ENetwork;
	formName?: string;
	required?: boolean;
	multipleCurrency?: boolean;
	amountExceeded?: boolean;
}

const getCurrencyLogo = (currency: string) => {
	switch (currency) {
		case 'USDT':
			return USDTLogo;
		case 'USDC':
			return USDCLogo;
		default:
			return currency;
	}
};

const getDecimalByToken = (token: string, network: ENetwork) => {
	const tokens = (networkConstants[network] as any).supportedTokens;
	const tokenData = tokens.find((t: any) => t.symbol === token);
	return tokenData?.decimals;
};

const MultipleAssetsDropDown = ({ network, onChange }: { network: ENetwork; onChange: (value: string) => void }) => {
	const tokens = (networkConstants[network] as any).supportedTokens as Array<{ symbol: string; logo: any }>;
	const nativeToken = networkConstants[network].tokenSymbol;
	const options = [
		{
			value: nativeToken,
			label: (
				<span className='flex gap-2 justify-center items-center'>
					<ParachainTooltipIcon src={networkConstants[network]?.logo} />
					{networkConstants[network]?.tokenSymbol}
				</span>
			)
		}
	];
	options.push(
		...(tokens.map((token) => ({
			value: token.symbol,
			label: (
				<span className='flex gap-x-1 justify-center items-center'>
					<ParachainTooltipIcon src={getCurrencyLogo(token.symbol)} />
					{token.symbol}
				</span>
			)
		})) as any)
	);

	return (
		<Select
		className='bg-bg-secondary [&_.ant-select-selector]:bg-bg-secondary rounded-r-lg [&_.ant-select-selector]:rounded-r-lg [&_.ant-select-selector]:p-0 w-24'
		options={options}
			defaultValue={nativeToken}
			onChange={onChange}
		/>
	);
};

const BalanceInput: React.FC<Props> = ({
	className,
	label = '',
	onChange,
	placeholder = '',
	defaultValue,
	network,
	formName,
	required = true,
	multipleCurrency = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	amountExceeded
}: Props) => {
	const [selectedCurrency, setSelectedCurrency] = useState(networkConstants[network]?.tokenSymbol);
	const ref = useRef<string>('');
	useEffect(() => {
		setSelectedCurrency(networkConstants[network]?.tokenSymbol);
		if (!defaultValue) {
			onChange(new BN(0), networkConstants[network]?.tokenSymbol);
		}
		ref.current = formatBalance(
			defaultValue || '0',
			{
				numberAfterComma: 3,
				withThousandDelimitor: false
			},
			network
		) || '';
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);
	return (
		<section className={`${className}`}>
			<label
				htmlFor='balance'
				className='text-label mb-[5px] block text-xs font-normal leading-[13px]'
			>
				{label}
			</label>
			<div className='flex items-center gap-x-[10px] relative'>
				<article className='w-full'>
					<Form.Item
						name={formName || 'balance'}
						rules={[
							{ required, message: 'Enter a valid amount' },
							() => ({
								validator(_, value) {
									if (Number.isNaN(Number(value))) {
										return Promise.reject(new Error('Enter a valid number'));
									}
									if (value) {
										const [, isValid] = inputToBn(value, network, false, getDecimalByToken(selectedCurrency, network));
										if (!isValid) {
											return Promise.reject(new Error('Enter a valid amount'));
										}
									}
									return Promise.resolve();
								}
							})
						]}
						rootClassName='mb-3'
					>
						<div className='flex h-[50px] items-center'>
							<Input
								id='balance'
								onChange={(a) => {
									const [balance, isValid] = inputToBn(
										a.target.value,
										network,
										true,
										getDecimalByToken(selectedCurrency, network)
									);
									if (isValid) {
										ref.current = a.target.value;
										onChange(balance, selectedCurrency);
									}
								}}
								value={ref.current}
								placeholder={`${placeholder} ${networkConstants[network]?.tokenSymbol}`}
								defaultValue={defaultValue}
								className={twMerge(
									'bg-bg-secondary h-full w-full rounded-lg border-0 p-3 pr-0 text-sm font-normal leading-[15px] text-white outline-0 placeholder:text-[#505050]',
									multipleCurrency && 'rounded-r-none w-1/2'
								)}
							/>
							{!multipleCurrency ? (
								<div className='absolute right-0 flex items-center justify-center gap-x-1 pr-3 text-white'>
									<ParachainTooltipIcon src={networkConstants[network]?.logo} />
									<span>{networkConstants[network]?.tokenSymbol}</span>
								</div>
							) : (
								<MultipleAssetsDropDown
									network={network}
									onChange={(currency) => {
										const [balance, isValid] = inputToBn(
											ref.current?.toString() || '0',
											network,
											false,
											getDecimalByToken(currency, network)
										);

										console.log('balance', balance.toString());
										setSelectedCurrency(currency);
										if (isValid) {
											onChange(balance as BN, currency);
										}
									}}
								/>
							)}
						</div>
					</Form.Item>
				</article>
			</div>
		</section>
	);
};

export default BalanceInput;
