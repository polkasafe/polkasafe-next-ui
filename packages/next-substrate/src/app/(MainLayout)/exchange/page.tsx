// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

'use client';

import './style.css';
// import { TransakConfig, Transak } from '@transak/transak-sdk';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { OnrampWebSDK } from '@onramp.money/onramp-web-sdk';
import { Dropdown, Form, Input } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import React, { useState } from 'react';
import Link from 'next/link';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { networks, onrampTokenProperties, onrampTokens } from '@next-common/global/networkConstants';
import ONRAMP_APP_ID from '@next-common/global/onrampAppId';
import { CircleArrowDownIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ParachainIcon } from '../../components/NetworksDropdown/NetworkCard';
import AddMultisigModal from '../../components/Multisig/AddMultisigModal';

enum EOnramp {
	BUY = 1,
	SELL = 2
}

const Exchange = ({ className }: { className?: string }) => {
	const { address: userAddress, activeMultisig } = useGlobalUserDetailsContext();
	const { activeOrg } = useActiveOrgContext();

	const activeMultisigData = activeOrg?.multisigs?.find((item) => item.address === activeMultisig);

	const [network, setNetwork] = useState<string>(
		activeMultisigData?.network || activeOrg?.multisigs?.[0]?.network || networks.POLKADOT
	);

	const [selectedMultisig, setSelectedMultisig] = useState<string>(
		activeMultisig || activeOrg?.multisigs?.[0]?.address || ''
	);

	const [onrampFlowType, setOnrampFlowType] = useState<EOnramp>(EOnramp.BUY);
	const [coinCode, setCoinCode] = useState(onrampTokens.POLKADOT);
	const [coinAmount, setCoinAmount] = useState<number>();

	const currencyOptions: ItemType[] = Object.values(onrampTokens)
		.filter((token) => (onrampFlowType === EOnramp.SELL ? onrampTokenProperties[token].offramp : true))
		.map((token) => ({
			key: token,
			label: (
				<span className='text-white flex items-center gap-x-2'>
					<ParachainIcon src={onrampTokenProperties[token]?.logo} />
					{onrampTokenProperties[token]?.tokenSymbol?.toUpperCase()}
				</span>
			)
		}));

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: JSON.stringify(item),
		label: (
			<AddressComponent
				isMultisig
				showNetworkBadge
				withBadge={false}
				network={item.network}
				address={item.address}
			/>
		)
	}));

	const onConfirm = () => {
		if (!selectedMultisig || !coinAmount || Number.isNaN(coinAmount)) return;

		// const transakConfig: TransakConfig = {
		// apiKey: process.env.NEXT_PUBLIC_POLKASAFE_TRANSAK_API_KEY,
		// environment: Transak.ENVIRONMENTS.PRODUCTION,
		// cryptoAmount: Number(coinAmount),
		// walletAddress: getEncodedAddress(walletAddress, network) || walletAddress,
		// productsAvailed: onrampFlowType
		// };

		// const transak = new Transak(transakConfig);

		// transak.init();

		const onramp = new OnrampWebSDK({
			appId: ONRAMP_APP_ID,
			coinAmount: Number(coinAmount),
			coinCode: onrampTokenProperties[coinCode].tokenSymbol,
			flowType: onrampFlowType,
			paymentMethod: 1,
			walletAddress: getEncodedAddress(selectedMultisig, network) || selectedMultisig
		});

		onramp.show();
	};

	return (
		<div
			className={`scale-[80%] w-[125%] h-[125%] p-5 origin-top-left bg-bg-main rounded-lg flex justify-center ${className}`}
		>
			{userAddress ? (
				<div className='h-full flex flex-col gap-y-5 bg-bg-secondary rounded-lg p-5'>
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
						<Dropdown
							trigger={['click']}
							className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'
							menu={{
								items: multisigOptions,
								onClick: (e) => {
									setSelectedMultisig(JSON.parse(e.key)?.address);
									setNetwork(JSON.parse(e.key)?.network);
								}
							}}
						>
							<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
								<AddressComponent
									isMultisig
									showNetworkBadge
									withBadge={false}
									network={network}
									address={selectedMultisig}
								/>
								<CircleArrowDownIcon className='text-primary' />
							</div>
						</Dropdown>
					</div>
					<div className='flex-1'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Token Amount*</label>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name='coin-amount'
							rules={[{ required: true }]}
							validateStatus={coinAmount && Number.isNaN(coinAmount) ? 'error' : 'success'}
							help={coinAmount && Number.isNaN(coinAmount) && 'Please enter a valid Amount'}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id='coin-amount'
									onChange={(e) => setCoinAmount(e.target.value as any)}
									placeholder='10'
									value={coinAmount}
									className='w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-main rounded-lg text-white pr-20'
								/>
								<Dropdown
									trigger={['click']}
									className={className}
									menu={{
										items: currencyOptions,
										onClick: (e) => setCoinCode(e.key as any)
									}}
								>
									<div className='absolute cursor-pointer right-0 text-white pr-3 gap-x-1 flex items-center justify-center'>
										<ParachainIcon src={onrampTokenProperties[coinCode]?.logo} />
										<span>{onrampTokenProperties[coinCode]?.tokenSymbol?.toUpperCase()}</span>
										<CircleArrowDownIcon className='text-primary ml-1' />
									</div>
								</Dropdown>
							</div>
						</Form.Item>
					</div>
					<PrimaryButton
						disabled={!selectedMultisig || !coinAmount || Number.isNaN(coinAmount)}
						className='flex justify-center'
						onClick={onConfirm}
					>
						Confirm
					</PrimaryButton>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/login'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Exchange;
