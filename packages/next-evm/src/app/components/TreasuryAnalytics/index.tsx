/* eslint-disable sort-keys */
import './style.css';
import { useActiveOrgContext } from '@next-evm/context/ActiveOrgContext';
import { DatePicker, Dropdown, Segmented, TimeRangePickerProps } from 'antd';
import React, { useEffect, useState } from 'react';
import Loader from '@next-common/ui-components/Loader';
import AddressComponent from '@next-evm/ui-components/AddressComponent';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import dayjs, { Dayjs } from 'dayjs';
import EmptyStateSVG from '@next-common/assets/Empty-State-TreasuryAnalytics.svg';
import { ETxnType, ITreasury, ITreasuryTxns } from '@next-common/types';
import returnTxUrl from '@next-common/global/gnosisService';
import { NETWORK, chainProperties } from '@next-common/global/evm-network-constants';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import GnosisSafeService from '@next-evm/services/Gnosis';
import { useWallets } from '@privy-io/react-auth';
import getHistoricalNativeTokenPrice from '@next-evm/utils/getHistoricalNativeTokenPrice';
import getHistoricalTokenPrice from '@next-evm/utils/getHistoricalTokenPrice';
import tokenToUSDConversion from '@next-evm/utils/tokenToUSDConversion';
import TransactionsByEachToken from './TransactionsByEachToken';
import TopAssetsCard from '../Home/TopAssetsCard';
import BalanceHistory from './BalanceHistory';
import TotalBalances from './TotalBalances';

enum EDateFilters {
	YESTERDAY = -1,
	WEEK = -7,
	MONTH = -30,
	QUARTER = -90,
	YEAR = -360,
	ALL = 0
}
// eslint-disable-next-line sonarjs/cognitive-complexity
const TreasuryAnalytics = () => {
	const { activeOrg } = useActiveOrgContext();

	const { wallets } = useWallets();
	const connectedWallet = wallets?.[0];

	const [loading, setLoading] = useState<boolean>(false);

	const [selectedID, setSelectedID] = useState<string>(activeOrg?.id || '');
	const [startDate, setStartDate] = useState<null | Dayjs>(null);
	const [endDate, setEndDate] = useState<null | Dayjs>(dayjs());
	const [outerDateFilter, setOuterDateFilter] = useState<EDateFilters>(EDateFilters.ALL);

	const [treasury, setTreasury] = useState<ITreasury>({});

	const [refetch, setRefetch] = useState<boolean>(false);

	useEffect(() => {
		if (activeOrg && activeOrg.id) {
			setSelectedID(activeOrg.id);
		}
	}, [activeOrg]);

	useEffect(() => {
		const fetchtxns = async () => {
			if (!activeOrg || !activeOrg.multisigs || !activeOrg.id) return;

			const organisationId = activeOrg.id;

			let orgTreasury: ITreasury = {};
			setLoading(true);

			// eslint-disable-next-line no-restricted-syntax
			for (const multisig of activeOrg.multisigs) {
				const txUrl = returnTxUrl(multisig.network as NETWORK);
				// eslint-disable-next-line no-await-in-loop
				const provider = await connectedWallet?.getEthersProvider();
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: provider
				});
				const gnosisService = new GnosisSafeService(web3Adapter, provider.getSigner(), txUrl);
				// eslint-disable-next-line no-await-in-loop
				const allTxns = await gnosisService.getAllTx(multisig.address, {
					executed: true,
					trusted: true
				});
				const txns = allTxns.results.filter((item) => item.transfers.length > 0);

				let totalIncomingUSD = 0;
				let totalOutgoingUSD = 0;
				const incomingTxns: ITreasuryTxns[] = [];
				const outgoingTxns: ITreasuryTxns[] = [];
				if (txns) {
					// eslint-disable-next-line no-restricted-syntax
					for (const txn of txns) {
						// eslint-disable-next-line no-restricted-syntax
						for (const item of txn.transfers) {
							const token = item.value || 0;
							const type = item.from === multisig.address ? ETxnType.OUTGOING : ETxnType.INCOMING;
							const timestamp = dayjs(txn.executionDate).toString();
							const txHash = item.transactionHash;
							const tokenAddress = item.tokenInfo ? item.tokenInfo.address : '';
							const tokenSymbol = item.tokenInfo
								? item.tokenInfo.symbol
								: chainProperties[multisig.network].tokenSymbol;

							const tokenLogoUri = item.tokenInfo
								? item.tokenInfo.logoUri || chainProperties[multisig.network]?.logo
								: chainProperties[multisig.network]?.logo;

							let usdValue = '0';

							if (!tokenAddress) {
								// eslint-disable-next-line no-await-in-loop
								const usd = await getHistoricalNativeTokenPrice(multisig.network as NETWORK, new Date(timestamp));
								usdValue = Number(usd).toFixed(4);
							} else {
								// eslint-disable-next-line no-await-in-loop
								const usd = await getHistoricalTokenPrice(
									multisig.network as NETWORK,
									tokenAddress,
									new Date(timestamp)
								);
								usdValue = Number(usd).toFixed(4);
							}

							const usd = tokenToUSDConversion(
								ethers.utils.formatUnits(
									BigInt(!Number.isNaN(token) ? token : 0).toString(),
									item.tokenInfo ? item.tokenInfo.decimals : chainProperties[multisig.network].decimals
								),
								usdValue
							);

							if (type === ETxnType.INCOMING) {
								totalIncomingUSD += Number(usd);
								incomingTxns.push({
									balance_token: ethers.utils.formatUnits(
										token.toString(),
										item.tokenInfo ? item.tokenInfo.decimals : chainProperties[multisig.network].decimals
									),
									balance_usd: usd.toString(),
									multisigAddress: multisig.address,
									network: multisig.network,
									tokenAddress,
									tokenSymbol,
									tokenLogoUri,
									timestamp,
									txHash,
									type
								});
							} else {
								totalOutgoingUSD += Number(usd);
								outgoingTxns.push({
									balance_token: ethers.utils.formatUnits(
										token.toString(),
										item.tokenInfo ? item.tokenInfo.decimals : chainProperties[multisig.network].decimals
									),
									balance_usd: usd.toString(),
									multisigAddress: multisig.address,
									network: multisig.network,
									tokenAddress,
									tokenSymbol,
									tokenLogoUri,
									timestamp,
									txHash,
									type
								});
							}
						}
					}
				}
				orgTreasury = {
					...orgTreasury,
					[organisationId]: orgTreasury[organisationId]
						? {
								totalIncomingUSD: orgTreasury[organisationId].totalIncomingUSD + totalIncomingUSD,
								totalOutgoingUSD: orgTreasury[organisationId].totalOutgoingUSD + totalOutgoingUSD,
								incomingTransactions: [...orgTreasury[organisationId].incomingTransactions, ...incomingTxns],
								outgoingTransactions: [...orgTreasury[organisationId].outgoingTransactions, ...outgoingTxns]
						  }
						: {
								totalIncomingUSD,
								totalOutgoingUSD,
								incomingTransactions: incomingTxns,
								outgoingTransactions: outgoingTxns
						  },
					[`${multisig.address}_${multisig.network}`]: {
						totalIncomingUSD,
						totalOutgoingUSD,
						incomingTransactions: incomingTxns,
						outgoingTransactions: outgoingTxns
					}
				};
			}
			setTreasury(orgTreasury);
			setLoading(false);
		};
		fetchtxns();
	}, [activeOrg, connectedWallet, refetch]);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: `${item.address}_${item.network}`,
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network as NETWORK}
					withBadge={false}
					address={item.address}
				/>
			</div>
		)
	}));

	multisigOptions?.unshift({
		key: activeOrg?.id,
		label: (
			<div className='flex items-center gap-x-3'>
				<Image
					width={30}
					height={30}
					className='rounded-full h-[30px] w-[30px]'
					src={activeOrg?.imageURI || emptyImage}
					alt='empty profile image'
				/>
				<div className='flex flex-col gap-y-[1px]'>
					<span className='text-sm text-white capitalize truncate max-w-[100px]'>{activeOrg?.name}</span>
					<span className='text-xs text-text_secondary'>{activeOrg?.members?.length} Members</span>
				</div>
			</div>
		)
	});

	const rangePresets: TimeRangePickerProps['presets'] = [
		{ label: <span className='text-text_secondary'>Yesterday</span>, value: [dayjs().add(-1, 'd'), dayjs()] },
		{ label: <span className='text-text_secondary'>Last week</span>, value: [dayjs().add(-7, 'd'), dayjs()] },
		{ label: <span className='text-text_secondary'>Last Month</span>, value: [dayjs().add(-1, 'm'), dayjs()] },
		{ label: <span className='text-text_secondary'>Last Quarter</span>, value: [dayjs().add(-3, 'm'), dayjs()] }
	];

	const onRangeChange = (dates: null | (Dayjs | null)[], dateStrings: string[]) => {
		if (dates) {
			console.log('From: ', dates[0], ', to: ', dates[1]);
			setStartDate(dates[0]);
			setEndDate(dates[1]);
			console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
		} else {
			setStartDate(null);
			setEndDate(null);
		}
	};

	return loading ? (
		<Loader />
	) : (
		<div className='flex flex-col gap-y-4'>
			<div className='flex justify-between items-center'>
				<Segmented
					size='small'
					onChange={(value) => {
						if (value === 0) {
							setStartDate(null);
							setEndDate(dayjs());
							setOuterDateFilter(EDateFilters.ALL);
							return;
						}
						setStartDate(dayjs(dayjs().add(Number(value), 'd')));
						setEndDate(dayjs());
						setOuterDateFilter(Number(value) as EDateFilters);
					}}
					className='bg-transparent text-text_secondary border border-bg-secondary p-1'
					value={outerDateFilter}
					options={[
						{
							label: '24H',
							value: EDateFilters.YESTERDAY
						},
						{
							label: '7D',
							value: EDateFilters.WEEK
						},
						{
							label: '30D',
							value: EDateFilters.MONTH
						},
						{
							label: '90D',
							value: EDateFilters.QUARTER
						},
						{
							label: '360D',
							value: EDateFilters.YEAR
						},
						{
							label: 'ALL',
							value: EDateFilters.ALL
						}
					]}
				/>
				<div className='flex gap-x-3'>
					<DatePicker.RangePicker
						onChange={onRangeChange}
						value={[startDate, endDate]}
						className='border border-primary shadow-none rounded-lg py-1 pxx-2 bg-highlight min-w-[200px] text-xs'
						presets={rangePresets}
					/>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg py-1 px-2 bg-bg-secondary cursor-pointer min-w-[200px] text-xs'
						menu={{
							items: multisigOptions,
							onClick: (e) => {
								setSelectedID(e.key);
							}
						}}
					>
						<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
							{selectedID === activeOrg?.id ? (
								<div className='flex items-center gap-x-3'>
									<Image
										width={20}
										height={20}
										className='rounded-full h-[30px] w-[30px]'
										src={activeOrg?.imageURI || emptyImage}
										alt='empty profile image'
									/>
									<div>
										<span className='text-sm text-white capitalize truncate max-w-[100px]'>{activeOrg?.name}</span>
									</div>
								</div>
							) : (
								<AddressComponent
									onlyAddress
									isMultisig
									addressLength={5}
									iconSize={18}
									showNetworkBadge
									network={selectedID.split('_')[1] as NETWORK}
									withBadge={false}
									address={selectedID.split('_')[0]}
								/>
							)}
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>
			</div>
			{/* <div className='rounded-xl p-5 bg-bg-secondary flex gap-x-5'>
				<div>
					<label className='text-text_secondary text-xs mb-1.5'>Incoming</label>
					<div className='text-success font-bold text-[22px]'>
						$ {selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalIncomingUSD) : '0.00'}
					</div>
				</div>
				<div>
					<Divider
						type='vertical'
						orientation='center'
						className='border border-text_secondary h-full'
					/>
				</div>
				<div>
					<label className='text-text_secondary text-xs mb-1.5'>Outgoing</label>
					<div className='text-failure font-bold text-[22px]'>
						$ {selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalOutgoingUSD) : '0.00'}
					</div>
				</div>
				<div>
					<Divider
						type='vertical'
						orientation='center'
						className='border border-text_secondary h-full'
					/>
				</div>
				<div>
					<label className='text-text_secondary text-xs mb-1.5'>Net</label>
					<div className='text-white font-bold text-[22px]'>
						${' '}
						{selectedID && treasury?.[selectedID]
							? formatBalance(Math.abs(treasury[selectedID].totalOutgoingUSD - treasury[selectedID].totalIncomingUSD))
							: '0.00'}
					</div>
				</div>
				<div className='flex-1' />
				<Button
					onClick={() => setRefetch((prev) => !prev)}
					disabled={loading}
					icon={
						<SyncOutlined
							spin={loading}
							className='text-primary'
						/>
					}
					className='text-primary bg-highlight outline-none border-none font-medium text-sm'
				>
					Refresh
				</Button>
			</div> */}
			<TotalBalances
				startDate={startDate}
				endDate={endDate}
				onReload={() => setRefetch((prev) => !prev)}
				incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
				outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
			/>
			<div className='rounded-xl p-5 bg-bg-secondary min-h-[300px] balance_history'>
				{!treasury?.[selectedID]?.incomingTransactions && !treasury?.[selectedID]?.outgoingTransactions ? (
					<div className='w-full flex flex-col gap-y-2 items-center h-full'>
						<EmptyStateSVG />
						<p className='text-lg font-medium text-white'>No Activity</p>
						<p className='text-sm text-text_secondary'>You have no activity yet</p>
					</div>
				) : (
					<BalanceHistory
						startDate={startDate}
						endDate={endDate}
						id={selectedID}
						incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
						outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
					/>
				)}
			</div>
			<div className='grid grid-cols-2 gap-x-4'>
				<TopAssetsCard
					className='bg-bg-secondary h-[90%]'
					multisigAddress={selectedID.split('_')[0]}
					network={selectedID.split('_')[1]}
				/>
				<TransactionsByEachToken
					className='bg-bg-secondary'
					incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
					outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
				/>
			</div>
		</div>
	);
};

export default TreasuryAnalytics;
