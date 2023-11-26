// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useGlobalUserDetailsContext } from '@next-evm/context/UserDetailsContext';
import { useGlobalApiContext } from '@next-evm/context/ApiContext';
import AddressQr from '@next-common/ui-components/AddressQr';
import { CopyIcon, QRIcon, AssetsIcon, ExternalLinkIcon } from '@next-common/ui-components/CustomIcons';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import copyText from '@next-evm/utils/copyText';
import shortenAddress from '@next-evm/utils/shortenAddress';

import ModalComponent from '@next-common/ui-components/ModalComponent';
import FundMultisig from '@next-evm/app/components/SendFunds/FundMultisig';
import SendFundsForm from '@next-evm/app/components/SendFunds/SendFundsForm';
import { chainProperties } from '@next-common/global/evm-network-constants';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import formatBalance from '@next-evm/utils/formatBalance';
import { currencyProperties } from '@next-common/global/currencyConstants';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

interface IDashboardCard {
	className?: string;
	setNewTxn: React.Dispatch<React.SetStateAction<boolean>>;
	transactionLoading: boolean;
	openTransactionModal: boolean;
	setOpenTransactionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DashboardCard = ({
	className,
	setNewTxn,
	transactionLoading,
	openTransactionModal,
	setOpenTransactionModal
}: IDashboardCard) => {
	const { activeMultisig, multisigAddresses, activeMultisigData, multisigSettings } = useGlobalUserDetailsContext();
	const { currency, allCurrencyPrices } = useGlobalCurrencyContext();
	const { allAssets, loadingAssets } = useMultisigAssetsContext();
	const { network } = useGlobalApiContext();

	const [openFundMultisigModal, setOpenFundMultisigModal] = useState(false);
	const currentMultisig = multisigAddresses?.find((item) => item.address === activeMultisig);
	const [totalAssetValue, setTotalAssetValue] = useState<string>('');

	useEffect(() => {
		if (allAssets && allAssets.length > 0) {
			const total = allAssets.reduce((sum, asset) => sum + Number(asset.balance_usd), 0);
			setTotalAssetValue(total.toString());
		}
	}, [allAssets]);

	return (
		<>
			<ModalComponent
				open={openTransactionModal}
				onCancel={() => {
					setOpenTransactionModal(false);
					setNewTxn((prev) => !prev);
				}}
				title={<h3 className='text-white mb-8 text-lg font-semibold'>Send Funds</h3>}
			>
				<SendFundsForm
					setNewTxn={setNewTxn}
					onCancel={() => setOpenTransactionModal(false)}
				/>
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
					<a
						href={`${chainProperties[network].blockExplorer}/address/${activeMultisig}`}
						target='_blank'
						className='flex gap-x-4 items-center'
						rel='noreferrer'
					>
						<ParachainIcon src={chainProperties[network].logo} />
					</a>
				</div>
				<div className='w-full'>
					<div className='flex gap-x-3 items-center'>
						<div className='relative'>
							<div className='border-2 border-primary p-1.5 rounded-full flex justify-center items-center'>
								<MetaMaskAvatar
									address={currentMultisig?.address || ''}
									size={50}
								/>
							</div>
							<div className=' bg-primary text-white text-sm rounded-lg absolute -bottom-1 left-[16px] px-2'>
								{activeMultisigData?.threshold ? activeMultisigData.threshold : currentMultisig?.threshold}/
								{activeMultisigData?.signatories?.length
									? activeMultisigData?.signatories?.length
									: currentMultisig?.signatories.length}
							</div>
						</div>
						<div>
							<div className='text-base font-bold text-white flex items-center gap-x-2'>
								{multisigSettings[activeMultisig]?.name || currentMultisig?.name}
							</div>
							<div className='flex text-xs'>
								<div
									title={activeMultisig || ''}
									className=' font-normal text-text_secondary'
								>
									{activeMultisig && shortenAddress(activeMultisig || '')}
								</div>
								<button
									className='ml-2 mr-1'
									onClick={() => copyText(activeMultisig)}
								>
									<CopyIcon className='text-primary' />
								</button>
								<a
									href={`${chainProperties[network].blockExplorer}/address/${activeMultisig}`}
									target='_blank'
									rel='noreferrer'
									className='text-primary mr-1'
								>
									<ExternalLinkIcon />
								</a>
								{currentMultisig?.address && (
									<Tooltip
										placement='right'
										className='cursor-pointer'
										title={
											<div className='p-2'>
												<AddressQr
													size={100}
													address={activeMultisig}
												/>
											</div>
										}
									>
										<QRIcon className='text-primary' />
									</Tooltip>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className='flex gap-x-5 flex-wrap text-xs'>
					{loadingAssets ? (
						<Skeleton
							paragraph={{ rows: 1, width: 150 }}
							active
						/>
					) : (
						<>
							<div>
								<div className='text-white'>Signatories</div>
								<div className='font-bold text-lg text-primary'>
									{activeMultisigData?.signatories?.length
										? activeMultisigData?.signatories?.length
										: currentMultisig?.signatories.length || 0}
								</div>
							</div>
							<div>
								<div className='text-white'>Tokens</div>
								<div className='font-bold text-lg text-primary'>{allAssets?.length || 0}</div>
							</div>
							<div>
								<div className='text-white'>Total Asset Value</div>
								<div className='font-bold text-lg text-primary'>
									{formatBalance(
										Number(totalAssetValue) * Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
									)}{' '}
									{currencyProperties[currency].symbol}
								</div>
							</div>
						</>
					)}
					{/* <div>
						<div className='text-white'>USD Amount</div>
						<div className='font-bold text-lg text-primary'>
							{0}
						</div>
					</div> */}
				</div>
				<div className='flex justify-around w-full mt-5'>
					<PrimaryButton
						icon={<PlusCircleOutlined />}
						onClick={() => setOpenTransactionModal(true)}
						loading={transactionLoading}
						className='w-[45%] flex items-center justify-center py-4 2xl:py-5 bg-primary text-white'
					>
						New Transaction
					</PrimaryButton>
					<PrimaryButton
						secondary
						onClick={() => setOpenFundMultisigModal(true)}
						className='w-[45%] flex items-center justify-center py-4 2xl:py-5 '
						icon={<AssetsIcon />}
					>
						Fund Multisig
					</PrimaryButton>
				</div>
			</div>
		</>
	);
};

export default DashboardCard;
