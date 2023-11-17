// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import { TransakConfig, Transak } from '@transak/transak-sdk';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Dropdown, Form, Input } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { CircleArrowDownIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import { ParachainIcon } from '../components/NetworksDropdown/NetworkCard';
import AddMultisigModal from '../components/Multisig/AddMultisigModal';

enum EOnramp {
	BUY = 'BUY',
	SELL = 'SELL'
}

const Exchange = ({ className }: { className?: string }) => {
	const { address: userAddress, activeMultisig } = useGlobalUserDetailsContext();
	const { allAssets } = useMultisigAssetsContext();
	const { network } = useGlobalApiContext();

	const [onrampFlowType, setOnrampFlowType] = useState<EOnramp>(EOnramp.BUY);
	const [coinCode, setCoinCode] = useState(allAssets[0]?.name);
	const [coinAmount, setCoinAmount] = useState<string>();
	const [maxAmount, setMaxAmount] = useState<string>(allAssets[0]?.balance_token);
	// const [defaultMax, setDefaultMax] = useState<boolean>(false);

	useEffect(() => {
		if (!allAssets || allAssets.length === 0) return;
		const max = allAssets.find((item) => item.name === coinCode)?.balance_token;
		setMaxAmount(max);
	}, [allAssets, coinCode]);

	const currencyOptions: ItemType[] =
		allAssets && allAssets.length > 0
			? allAssets.map((token) => ({
					key: token.name,
					label: (
						<span className='text-white flex items-center gap-x-2'>
							<ParachainIcon src={token?.logoURI} />
							{token?.name}
						</span>
					)
			  }))
			: [];

	const onConfirm = () => {
		if (!activeMultisig || !coinAmount || Number.isNaN(coinAmount)) return;

		const transakConfig: TransakConfig = {
			apiKey: process.env.NEXT_PUBLIC_POLKASAFE_TRANSAK_API_KEY,
			environment: Transak.ENVIRONMENTS.PRODUCTION,
			defaultNetwork: network,
			defaultCryptoAmount: Number(coinAmount),
			cryptoAmount: Number(coinAmount),
			cryptoCurrencyCode: coinCode,
			walletAddress: activeMultisig,
			productsAvailed: onrampFlowType
		};

		const transak = new Transak(transakConfig);

		transak.init();
	};

	return (
		<div
			className={`scale-[80%] w-[125%] h-[125%] p-5 origin-top-left bg-bg-main rounded-lg flex justify-center ${className}`}
		>
			{userAddress ? (
				<Form className='h-full flex flex-col gap-y-5 bg-bg-secondary rounded-lg p-5'>
					<AddMultisigModal />
					<div className='w-full flex items-center gap-x-3'>
						<span
							onClick={() => setOnrampFlowType(EOnramp.BUY)}
							className={`p-[10px] bg-opacity-10 text-xl text-white flex items-center justify-center flex-col gap-y-3 ${
								onrampFlowType === EOnramp.BUY ? 'bg-success text-success' : 'bg-text_secondary'
							} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<PlusCircleOutlined />
							Buy
						</span>
						<span
							onClick={() => setOnrampFlowType(EOnramp.SELL)}
							className={`p-[10px] bg-opacity-10 text-xl text-white flex items-center justify-center flex-col gap-y-3 ${
								onrampFlowType === EOnramp.SELL ? 'bg-success text-success' : 'bg-text_secondary'
							} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<MinusCircleOutlined />
							Sell
						</span>
					</div>
					<div>
						<div className='flex items-center justify-between mb-[5px]'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Wallet Address*</label>
						</div>
						<article className='w-full p-[10px] border border-solid border-primary rounded-lg flex items-center justify-between'>
							<AddressComponent
								withBadge={false}
								address={activeMultisig}
							/>
						</article>
					</div>
					<div className='flex-1'>
						<div className='flex justify-between items-center mb-[5px]'>
							<label className='text-primary font-normal text-xs leading-[13px] block'>Token Amount*</label>
							<div className='bg-highlight text-primary rounded-lg px-[10px] py-[6px] ml-auto font-normal text-xs leading-[13px] flex items-center justify-center'>
								Balance:{' '}
								{Number(maxAmount)
									.toFixed(3)
									.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
								{coinCode}
							</div>
						</div>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='coin-amount'
							rules={[{ required: true }]}
							validateStatus={
								!coinAmount || Number.isNaN(Number(coinAmount)) || Number(coinAmount) > Number(maxAmount)
									? 'error'
									: 'success'
							}
							help={
								coinAmount && Number.isNaN(Number(coinAmount))
									? 'Please enter a valid Amount'
									: Number(coinAmount) > Number(maxAmount) && 'InSufficient Balance in Multisig'
							}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='coin-amount'
									onChange={(e) => setCoinAmount(e.target.value)}
									placeholder='10'
									value={coinAmount}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-main rounded-lg text-white pr-20'
								/>
								<button
									onClick={() => setCoinAmount(maxAmount)}
									className='text-primary bg-transparent outline-none border-none absolute right-[120px]'
								>
									MAX
								</button>
								<Dropdown
									trigger={['click']}
									className={className}
									menu={{
										items: currencyOptions,
										onClick: (e) => setCoinCode(e.key)
									}}
								>
									<div className='absolute cursor-pointer right-0 text-white pr-3 flex items-center gap-x-1 justify-center'>
										<ParachainIcon src={allAssets?.find((item) => item.name === coinCode)?.logoURI || ''} />
										<span>{coinCode}</span>
										<CircleArrowDownIcon className='text-primary ml-1' />
									</div>
								</Dropdown>
							</div>
						</Form.Item>
					</div>
					<PrimaryButton
						disabled={
							!activeMultisig ||
							!coinAmount ||
							Number.isNaN(Number(coinAmount)) ||
							Number(coinAmount) === 0 ||
							Number(coinAmount) > Number(maxAmount)
						}
						className='flex justify-center'
						onClick={onConfirm}
					>
						Confirm
					</PrimaryButton>
				</Form>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Exchange;
