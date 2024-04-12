import ModalComponent from '@next-common/ui-components/ModalComponent';
import PrimaryButton from '@next-common/ui-components/PrimaryButton';
import { Dropdown, Skeleton } from 'antd';
import React, { useState } from 'react';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useMultisigAssetsContext } from '@next-evm/context/MultisigAssetsContext';
import { AssetsIcon } from '@next-common/ui-components/CustomIcons';
import { PlusCircleOutlined } from '@ant-design/icons';
import formatBalance from '@next-evm/utils/formatBalance';
import { useGlobalCurrencyContext } from '@next-evm/context/CurrencyContext';
import { currencyProperties } from '@next-common/global/currencyConstants';
import SendFundsForm, { ETransactionTypeEVM } from '../SendFunds/SendFundsForm';
import FundMultisig from '../SendFunds/FundMultisig';
import ChangeCurrency from '../Assets/ChangeCurrency';

interface IOrganisationAssetsCard {
	setNewTxn: React.Dispatch<React.SetStateAction<boolean>>;
	transactionLoading: boolean;
	openTransactionModal: boolean;
	setOpenTransactionModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrganisationAssetsCard = ({
	setNewTxn,
	transactionLoading,
	openTransactionModal,
	setOpenTransactionModal
}: IOrganisationAssetsCard) => {
	const [transactionType, setTransactionType] = useState<ETransactionTypeEVM>(ETransactionTypeEVM.SEND_TOKEN);
	const [openFundMultisigModal, setOpenFundMultisigModal] = useState(false);
	const { organisationBalance, loadingAssets } = useMultisigAssetsContext();
	const { allCurrencyPrices, currency } = useGlobalCurrencyContext();

	const transactionTypes: ItemType[] = Object.values(ETransactionTypeEVM)
		// .filter((item) => {
		// return !(item === ETransactionTypeEVM.STREAM_PAYMENTS && !chainProperties[network].nativeSuperTokenAddress);
		// })
		.map((item) => ({
			key: item,
			label: <span className='text-white flex items-center gap-x-2'>{item}</span>
		}));

	const fiatBalanceInUSD = Number(organisationBalance?.total).toFixed(4);
	return (
		<>
			<ModalComponent
				open={openTransactionModal}
				onCancel={() => {
					setOpenTransactionModal(false);
					setNewTxn((prev) => !prev);
				}}
				title={<h3 className='text-white mb-8 text-lg font-semibold'>{transactionType}</h3>}
			>
				<SendFundsForm
					setNewTxn={setNewTxn}
					onCancel={() => setOpenTransactionModal(false)}
					transactionType={transactionType}
					setTransactionType={setTransactionType}
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
			<div className='relative overflow-hidden bg-bg-main flex flex-col justify-between border border-text_placeholder rounded-xl p-8 shadow-lg h-[17rem] scale-90 w-[111%] origin-top-left'>
				<div className='circle_1 absolute' />
				<div className='circle_2 absolute' />
				<div className='circle_3 absolute' />
				<div>
					<p className='text-sm text-text_secondary mb-3 flex items-center justify-between'>
						Total Balance
						<ChangeCurrency small />
					</p>
					{loadingAssets ? (
						<Skeleton
							paragraph={{ rows: 0, width: 150 }}
							active
						/>
					) : (
						<p className='text-[30px] font-bold text-white'>
							{allCurrencyPrices[currencyProperties[currency]?.symbol]
								? formatBalance(
										Number(fiatBalanceInUSD) * Number(allCurrencyPrices[currencyProperties[currency].symbol]?.value)
								  )
								: fiatBalanceInUSD}{' '}
							{allCurrencyPrices[currencyProperties[currency]?.symbol]?.code}
						</p>
					)}
				</div>
				<div className='flex justify-between w-full mt-5'>
					<Dropdown
						trigger={['click']}
						menu={{
							items: transactionTypes,
							onClick: (e) => {
								setTransactionType(e.key as ETransactionTypeEVM);
								setOpenTransactionModal(true);
							}
						}}
					>
						<PrimaryButton
							// disabled={notOwnerOfSafe}
							icon={<PlusCircleOutlined />}
							loading={transactionLoading}
							className='w-[45%] flex items-center justify-center py-4 2xl:py-5'
						>
							New Transaction
						</PrimaryButton>
					</Dropdown>
					<PrimaryButton
						// disabled={notOwnerOfSafe}
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

export default OrganisationAssetsCard;
