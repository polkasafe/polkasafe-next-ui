import './style.css';
import { SyncOutlined } from '@ant-design/icons';
import { useActiveOrgContext } from '@next-substrate/context/ActiveOrgContext';
import { Button, DatePicker, Divider, Dropdown, Segmented, TimeRangePickerProps } from 'antd';
import React, { useState } from 'react';
import Loader from '@next-common/ui-components/Loader';
import AddressComponent from '@next-common/ui-components/AddressComponent';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import Image from 'next/image';
import emptyImage from '@next-common/assets/icons/empty-image.png';
import useFetch from '@next-substrate/hooks/useFetch';
import firebaseFunctionsHeader from '@next-common/global/firebaseFunctionsHeader';
import formatBalance from '@next-substrate/utils/formatBalance';
import { FIREBASE_FUNCTIONS_URL } from '@next-common/global/apiUrls';
import dayjs, { Dayjs } from 'dayjs';
import EmptyStateSVG from '@next-common/assets/Empty-State-TreasuryAnalytics.svg';
import { ITreasury } from '@next-common/types';
import BalanceHistory from './BalanceHistory';
import TopAssetsCard from '../Home/TopAssetsCard';
import TransactionsByEachToken from './TransactionsByEachToken';

enum EDateFilters {
	YESTERDAY = -1,
	WEEK = -7,
	MONTH = -30,
	QUARTER = -90,
	YEAR = -360
}
// eslint-disable-next-line sonarjs/cognitive-complexity
const TreasuryAnalytics = () => {
	const { activeOrg } = useActiveOrgContext();

	const {
		data: treasury,
		// error,
		loading,
		refetch
	} = useFetch<ITreasury>({
		body: {
			multisigs: activeOrg?.multisigs || [],
			organisationId: activeOrg?.id || ''
		},
		cache: {
			enabled: true,
			tte: 60
		},
		headers: firebaseFunctionsHeader(),
		key: 'treasury',
		url: `${FIREBASE_FUNCTIONS_URL}/getTreasuryAnalyticsForMultisigs_substrate`
	});

	const [selectedID, setSelectedID] = useState<string>(activeOrg?.id || '');
	const [startDate, setStartDate] = useState<null | Dayjs>(null);
	const [endDate, setEndDate] = useState<null | Dayjs>(dayjs());
	const [outerDateFilter, setOuterDateFilter] = useState<EDateFilters>(EDateFilters.YEAR);

	const multisigOptions: ItemType[] = activeOrg?.multisigs?.map((item) => ({
		key: `${item.address}_${item.network}`,
		label: (
			<div className='scale-90 origin-top-left'>
				<AddressComponent
					isMultisig
					showNetworkBadge
					network={item.network}
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
			console.log('Clear');
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
					onChange={(value) => {
						setStartDate(dayjs(dayjs().add(Number(value), 'd')));
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
						}
					]}
				/>
				<div className='flex gap-x-3'>
					<DatePicker.RangePicker
						onChange={onRangeChange}
						value={[startDate, endDate]}
						className='border border-primary shadow-none rounded-lg p-2 bg-highlight min-w-[260px]'
						presets={rangePresets}
					/>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer min-w-[200px]'
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
										width={25}
										height={25}
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
									network={selectedID.split('_')[1]}
									withBadge={false}
									address={selectedID.split('_')[0]}
								/>
							)}
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>
			</div>
			<div className='rounded-xl p-5 bg-bg-secondary flex gap-x-5'>
				<div>
					<label className='text-text_secondary text-sm mb-2'>Incoming</label>
					<div className='text-success font-bold text-[25px]'>
						$ {selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalIncomingUSD) : '0.00'}
					</div>
				</div>
				<Divider
					type='vertical'
					orientation='center'
					className='border border-text_secondary h-full'
				/>
				<div>
					<label className='text-text_secondary text-sm mb-2'>Outgoing</label>
					<div className='text-failure font-bold text-[25px]'>
						$ {selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalOutgoingUSD) : '0.00'}
					</div>
				</div>
				<Divider
					type='vertical'
					orientation='center'
					className='border border-text_secondary h-full'
				/>
				<div>
					<label className='text-text_secondary text-sm mb-2'>Net</label>
					<div className='text-white font-bold text-[25px]'>
						${' '}
						{selectedID && treasury?.[selectedID]
							? formatBalance(Math.abs(treasury[selectedID].totalOutgoingUSD - treasury[selectedID].totalIncomingUSD))
							: '0.00'}
					</div>
				</div>
				<div className='flex-1' />
				<Button
					size='large'
					onClick={() => refetch(true)}
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
			</div>
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
				<TopAssetsCard className='bg-bg-secondary' />
				<TransactionsByEachToken
					className='bg-bg-secondary'
					incomingUSD={
						selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalIncomingUSD) : '0.00'
					}
					outgoingUSD={
						selectedID && treasury?.[selectedID] ? formatBalance(treasury[selectedID].totalOutgoingUSD) : '0.00'
					}
					incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
					outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
				/>
			</div>
		</div>
	);
};

export default TreasuryAnalytics;
