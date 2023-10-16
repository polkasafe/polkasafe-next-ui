// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import Identicon from '@polkadot/react-identicon';
import { Button, Dropdown, Skeleton, Tooltip, Spin } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useCallback, useEffect, useState } from 'react';
import brainIcon from '@next-common/assets/icons/brain-icon.svg';
import chainIcon from '@next-common/assets/icons/chain-icon.svg';
import dotIcon from '@next-common/assets/icons/image 39.svg';
import subscanIcon from '@next-common/assets/icons/subscan.svg';
import polkadotIcon from '@next-common/assets/parachains-icons/polkadot.svg';
import { useGlobalApiContext } from '@next-substrate/context/ApiContext';
import { useGlobalCurrencyContext } from '@next-substrate/context/CurrencyContext';
import { useGlobalUserDetailsContext } from '@next-substrate/context/UserDetailsContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import FIREBASE_FUNCTIONS_URL from '@next-common/global/firebaseFunctionsUrl';
import { IAsset } from '@next-common/types';
// import AddressQr from '@next-common/ui-components/AddressQr';
import { CopyIcon, WalletIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import copyText from '@next-substrate/utils/copyText';
import getEncodedAddress from '@next-substrate/utils/getEncodedAddress';
import shortenAddress from '@next-substrate/utils/shortenAddress';
import styled from 'styled-components';

import Image from 'next/image';
import ModalComponent from '@next-common/ui-components/ModalComponent';
import ExistentialDeposit from '../SendFunds/ExistentialDeposit';
import FundMultisig from '../SendFunds/FundMultisig';
import SendFundsForm, { ETransactionType } from '../SendFunds/SendFundsForm';

interface IDashboardCard {
	className?: string;
	hasProxy: boolean;
	setNewTxn: React.Dispatch<React.SetStateAction<boolean>>;
	transactionLoading: boolean;
	openTransactionModal: boolean;
	setOpenTransactionModal: React.Dispatch<React.SetStateAction<boolean>>;
	isOnchain: boolean;
}

const DashboardCard = ({
	className,
	setNewTxn,
	hasProxy,
	transactionLoading,
	openTransactionModal,
	setOpenTransactionModal,
	isOnchain // eslint-disable-next-line sonarjs/cognitive-complexity
}: IDashboardCard) => {
	const { activeMultisig, multisigAddresses, multisigSettings, isProxy, setUserDetailsContextState } =
		useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	const [assetsData, setAssetsData] = useState<IAsset[]>([]);
	const [openFundMultisigModal, setOpenFundMultisigModal] = useState(false);
	const [signatureLoader, setsignatureLoader] = useState<boolean>(true);
	const [assetDataLoader, setassetDataLoader] = useState<boolean>(true);
	const [transactionType, setTransactionType] = useState<ETransactionType>(ETransactionType.SEND_TOKEN);
	const currentMultisig = multisigAddresses?.find(
		(item) => item.address === activeMultisig || item.proxy === activeMultisig
	);

	const transactionTypes: ItemType[] = Object.values(ETransactionType)
		.filter(
			(item) =>
				!(
					(['alephzero', 'astar', 'assethub-polkadot', 'assethub-kusama'].includes(network) &&
						item === ETransactionType.SUBMIT_PREIMAGE) ||
					(!['polkadot', 'kusama'].includes(network) && item === ETransactionType.SUBMIT_PROPOSAL)
				)
		)
		.map((item) => ({
			key: item,
			label: <span className='text-white flex items-center gap-x-2'>{item}</span>
		}));

	const handleGetAssets = useCallback(async () => {
		try {
			const address = typeof window !== 'undefined' && localStorage.getItem('address');
			const signature = typeof window !== 'undefined' && localStorage.getItem('signature');

			if (!address || !signature || !activeMultisig) return;

			const getAssestsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAssetsForAddress`, {
				body: JSON.stringify({
					address: activeMultisig,
					network
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data, error } = (await getAssestsRes.json()) as { data: IAsset[]; error: string };
			if (currentMultisig) {
				setsignatureLoader(false);
			}
			if (error) {
				setassetDataLoader(false);
				return;
			}

			if (data) {
				setassetDataLoader(false);
				setAssetsData(data);
			}
		} catch (error) {
			console.log('ERROR', error);
		}
	}, [activeMultisig, currentMultisig, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	return (
		<>
			<ModalComponent
				open={openTransactionModal}
				onCancel={() => {
					setOpenTransactionModal(false);
					setNewTxn((prev) => !prev);
				}}
				title={
					<h3 className='text-white mb-8 text-lg font-semibold'>
						{isOnchain ? transactionType : 'Existential Deposit'}
					</h3>
				}
			>
				{isOnchain ? (
					<SendFundsForm
						transactionType={transactionType}
						setTransactionType={setTransactionType}
						setNewTxn={setNewTxn}
						onCancel={() => setOpenTransactionModal(false)}
					/>
				) : (
					<ExistentialDeposit
						setNewTxn={setNewTxn}
						onCancel={() => setOpenTransactionModal(false)}
					/>
				)}
			</ModalComponent>
			<ModalComponent
				open={openFundMultisigModal}
				onCancel={() => setOpenFundMultisigModal(false)}
				title={<h3 className='text-white mb-8 text-lg font-semibold'>Fund Multisig</h3>}
			>
				<FundMultisig
					setNewTxn={setNewTxn}
					onCancel={() => setOpenFundMultisigModal(false)}
				/>
			</ModalComponent>
			<h2 className='text-base font-bold text-white mb-2'>Overview</h2>
			<div
				className={`${className} relative bg-bg-main flex flex-col justify-between rounded-lg p-5 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left`}
			>
				<div className='absolute right-5 top-5'>
					<div className='flex gap-x-4 items-center'>
						<a
							className='w-5'
							target='_blank'
							href='https://polkadot.js.org/apps/#/accounts'
							rel='noreferrer'
						>
							<Image
								className='w-5'
								src={polkadotIcon}
								alt='icon'
							/>
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://explorer.polkascan.io/${network}/account/${activeMultisig}`}
							rel='noreferrer'
						>
							<Image
								className='w-5'
								src={brainIcon}
								alt='icon'
							/>
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://dotscanner.com/${network}/account/${activeMultisig}?utm_source=polkadotjs`}
							rel='noreferrer'
						>
							<Image
								className='w-5 cursor-pointer'
								src={dotIcon}
								alt='icon'
							/>
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://${network}.polkaholic.io/account/${activeMultisig}?group=overview&chainfilters=all`}
							rel='noreferrer'
						>
							<Image
								className='w-5 cursor-pointer'
								src={chainIcon}
								alt='icon'
							/>
						</a>
						<a
							className='w-5'
							target='_blank'
							href={`https://${network}.subscan.io/account/${activeMultisig}`}
							rel='noreferrer'
						>
							<Image
								className='w-5 cursor-pointer'
								src={subscanIcon}
								alt='icon'
							/>
						</a>
					</div>
				</div>
				<div className='w-full'>
					<div className='flex gap-x-3 items-center'>
						<div className='relative'>
							<Identicon
								className={`border-2 rounded-full bg-transparent ${
									hasProxy && isProxy ? 'border-[#FF79F2]' : 'border-primary'
								} p-1.5`}
								value={activeMultisig}
								size={50}
								theme='polkadot'
							/>
							<div
								className={`${
									hasProxy && isProxy ? 'bg-[#FF79F2] text-highlight' : 'bg-primary text-white'
								} text-sm rounded-lg absolute -bottom-0 left-[16px] px-2`}
							>
								{currentMultisig?.threshold}/{currentMultisig?.signatories.length}
							</div>
						</div>
						<div>
							<div className='text-base font-bold text-white flex items-center gap-x-2'>
								{multisigSettings?.[`${activeMultisig}_${network}`]?.name || currentMultisig?.name}
								<div
									className={`px-2 py-[2px] rounded-md text-xs font-medium ${
										hasProxy && isProxy ? 'bg-[#FF79F2] text-highlight' : 'bg-primary text-white'
									}`}
								>
									{hasProxy && isProxy ? 'Proxy' : 'Multisig'}
								</div>
								{hasProxy && (
									<Tooltip title='Switch Account'>
										<Button
											className='border-none outline-none w-auto rounded-full p-0'
											onClick={() => setUserDetailsContextState((prev) => ({ ...prev, isProxy: !prev.isProxy }))}
										>
											<SyncOutlined className='text-text_secondary text-base' />
										</Button>
									</Tooltip>
								)}
							</div>
							<div className='flex text-xs'>
								<div
									title={(activeMultisig && getEncodedAddress(activeMultisig, network)) || ''}
									className=' font-normal text-text_secondary'
								>
									{activeMultisig && shortenAddress(getEncodedAddress(activeMultisig, network) || '')}
								</div>
								<button
									className='ml-2 mr-1'
									onClick={() => copyText(activeMultisig, true, network)}
								>
									<CopyIcon className='text-primary' />
								</button>
								{/* <button onClick={() => openModal('Address QR', <AddressQr address={activeMultisig} />)}>
									<QRIcon className='text-primary' />
								</button> */}
							</div>
						</div>
					</div>
				</div>
				<div className='flex gap-x-5 flex-wrap text-xs'>
					{assetDataLoader ? (
						<Skeleton
							paragraph={{ rows: 1, width: 150 }}
							active
						/>
					) : (
						<>
							<div>
								<div className='text-white'>Signatories</div>
								<div className='font-bold text-lg text-primary'>
									{signatureLoader ? <Spin size='default' /> : currentMultisig?.signatories.length || 0}
								</div>
							</div>
							<div>
								<div className='text-white'>Tokens</div>
								<div className='font-bold text-lg text-primary'>
									{assetDataLoader ? <Spin size='default' /> : assetsData.length}
								</div>
							</div>
							<div>
								<div className='text-white'>{currencyProperties[currency].symbol} Amount</div>
								<div className='font-bold text-lg text-primary'>
									{assetDataLoader ? (
										<Spin size='default' />
									) : (
										(
											assetsData.reduce((total, item) => total + Number(item.balance_usd), 0) * Number(currencyPrice)
										).toFixed(2) || 'N/A'
									)}
								</div>
							</div>
						</>
					)}
				</div>
				<div className='flex justify-around w-full mt-5'>
					<Dropdown
						trigger={['click']}
						menu={{
							items: transactionTypes,
							onClick: (e) => {
								setTransactionType(e.key as ETransactionType);
								setOpenTransactionModal(true);
							}
						}}
					>
						<PrimaryButton
							icon={<PlusCircleOutlined />}
							loading={transactionLoading}
							className='w-[45%] flex items-center justify-center py-4 2xl:py-5'
						>
							New Transaction
						</PrimaryButton>
					</Dropdown>
					<PrimaryButton
						secondary
						onClick={() => setOpenFundMultisigModal(true)}
						className='w-[45%] flex items-center justify-center py-4 2xl:py-5 '
					>
						<WalletIcon /> Fund Multisig
					</PrimaryButton>
				</div>
			</div>
		</>
	);
};

export default styled(DashboardCard)`
	.ant-spin-nested-loading .ant-spin-blur {
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after {
		opacity: 1 !important;
	}
`;
