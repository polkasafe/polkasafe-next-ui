// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// // import { TransakConfig, Transak } from '@transak/transak-sdk';
// import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
// import { OnrampWebSDK } from '@onramp.money/onramp-web-sdk';
// import { Dropdown, Form, Input } from 'antd';
// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { ENetwork } from '@common/enum/substrate';
// import Address from '@common/global-ui-components/Address';
// import { IMultisig } from '@common/types/substrate';
// import { onrampTokenProperties, onrampTokens } from '@common/constants/substrateNetworkConstant';
// import ParachainTooltipIcon from '@common/global-ui-components/ParachainTooltipIcon';
// import getEncodedAddress from '@common/utils/getEncodedAddress';
// import { CircleArrowDownIcon, ExternalLinkIcon } from '@common/global-ui-components/Icons';
// import InfoBox from '@common/global-ui-components/InfoBox';
// import ActionButton from '@common/global-ui-components/ActionButton';
// import { useUser } from '@substrate/app/atoms/auth/authAtoms';
// import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';

// enum EOnramp {
// 	BUY = 1,
// 	SELL = 2
// }

// eslint-disable-next-line sonarjs/cognitive-complexity
const Exchange = () => {
	// const [user] = useUser();
	// const [organisation] = useOrganisation();

	// const multisigOptions = organisation?.multisigs
	// 	?.filter((item) => [ENetwork.POLKADOT, ENetwork.KUSAMA].includes(item.network))
	// 	.map((item) => ({
	// 		key: JSON.stringify(item),
	// 		label: (
	// 			<Address
	// 				isMultisig
	// 				showNetworkBadge
	// 				withBadge={false}
	// 				network={item.network}
	// 				address={item.address}
	// 			/>
	// 		)
	// 	}));

	// const [network, setNetwork] = useState<ENetwork>(
	// 	multisigOptions && multisigOptions.length > 0
	// 		? (JSON.parse(multisigOptions[0].key as string) as IMultisig).network
	// 		: ENetwork.POLKADOT
	// );

	// const [selectedMultisig, setSelectedMultisig] = useState<string>(
	// 	multisigOptions && multisigOptions.length > 0
	// 		? (JSON.parse(multisigOptions[0].key as string) as IMultisig).address
	// 		: ''
	// );

	// useEffect(() => {
	// 	if (multisigOptions && multisigOptions.length > 0) {
	// 		setSelectedMultisig((JSON.parse(multisigOptions[0].key as string) as IMultisig).address);
	// 		setNetwork((JSON.parse(multisigOptions[0].key as string) as IMultisig).network);
	// 	}
	// }, [multisigOptions]);

	// const [onrampFlowType, setOnrampFlowType] = useState<EOnramp>(EOnramp.BUY);
	// const [coinCode, setCoinCode] = useState(onrampTokens.POLKADOT);
	// const [coinAmount, setCoinAmount] = useState<number>();

	// const currencyOptions = Object.values(onrampTokens)
	// 	.filter((token) => (onrampFlowType === EOnramp.SELL ? onrampTokenProperties[token].offramp : true))
	// 	.map((token) => ({
	// 		key: token,
	// 		label: (
	// 			<span className='text-white flex items-center gap-x-2'>
	// 				<ParachainTooltipIcon src={onrampTokenProperties[token]?.logo} />
	// 				{onrampTokenProperties[token]?.tokenSymbol?.toUpperCase()}
	// 			</span>
	// 		)
	// 	}));

	// const onConfirm = () => {
	// 	if (!selectedMultisig || !coinAmount || Number.isNaN(coinAmount)) return;

	// 	// const transakConfig: TransakConfig = {
	// 	// apiKey: process.env.NEXT_PUBLIC_POLKASAFE_TRANSAK_API_KEY,
	// 	// environment: Transak.ENVIRONMENTS.PRODUCTION,
	// 	// cryptoAmount: Number(coinAmount),
	// 	// walletAddress: getEncodedAddress(walletAddress, network) || walletAddress,
	// 	// productsAvailed: onrampFlowType
	// 	// };

	// 	// const transak = new Transak(transakConfig);

	// 	// transak.init();

	// 	const onramp = new OnrampWebSDK({
	// 		appId: Number(process.env.NEXT_ONRAMP_APP_ID),
	// 		coinAmount: Number(coinAmount),
	// 		coinCode: onrampTokenProperties[coinCode].tokenSymbol,
	// 		flowType: onrampFlowType,
	// 		paymentMethod: 1,
	// 		walletAddress: getEncodedAddress(selectedMultisig, network) || selectedMultisig
	// 	});

	// 	onramp.show();
	// };

	return (
		<div className={`p-5 origin-top-left bg-bg-main rounded-lg flex justify-center h-full`}>
			{/* {user && user.address ? (
				<div className='h-full flex flex-col gap-y-5 bg-bg-secondary rounded-lg p-5'>
					<div className='w-full flex items-center gap-x-3'>
						<span
							onClick={() => setOnrampFlowType(EOnramp.BUY)}
							className={`p-[10px] text-xl text-white flex items-center justify-center flex-col gap-y-3 ${
								onrampFlowType === EOnramp.BUY ? 'bg-bg-success text-success' : 'bg-[#8b8b8b]/[0.1]'
							} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<PlusCircleOutlined />
							Buy
						</span>
						<span
							onClick={() => setOnrampFlowType(EOnramp.SELL)}
							className={`p-[10px] text-xl text-white flex items-center justify-center flex-col gap-y-3 ${
								onrampFlowType === EOnramp.SELL ? 'bg-bg-success text-success' : 'bg-[#8b8b8b]/[0.1]'
							} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<MinusCircleOutlined />
							Sell
						</span>
					</div>
					{multisigOptions && multisigOptions.length > 0 ? (
						<>
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
										<Address
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
											menu={{
												items: currencyOptions,
												onClick: (e) => setCoinCode(e.key as any)
											}}
										>
											<div className='absolute cursor-pointer right-0 text-white pr-3 gap-x-1 flex items-center justify-center'>
												<ParachainTooltipIcon src={onrampTokenProperties[coinCode]?.logo} />
												<span>{onrampTokenProperties[coinCode]?.tokenSymbol?.toUpperCase()}</span>
												<CircleArrowDownIcon className='text-primary ml-1' />
											</div>
										</Dropdown>
									</div>
								</Form.Item>
							</div>
						</>
					) : (
						<div className='flex-1'>
							<InfoBox message='Please create a Multisig in Polkadot or Kusama' />
						</div>
					)}
					<ActionButton
						disabled={!selectedMultisig || !coinAmount || Number.isNaN(coinAmount)}
						label='Confirm'
						onClick={onConfirm}
					/>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link href='/login'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)} */}
		</div>
	);
};

export default Exchange;
