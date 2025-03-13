'use client';

import './style.css';
import { DatePicker, Dropdown, Segmented, TimeRangePickerProps } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import emptyImage from '@common/assets/icons/empty-image.png';
import dayjs, { Dayjs } from 'dayjs';
import EmptyStateSVG from '@common/assets/icons/treasury-analytics-icon.svg';
// import { ITreasury } from '@next-common/types';
import BalanceHistory from './BalanceHistory';
// import TopAssetsCard from '../Home/TopAssetsCard';
// import TransactionsByEachToken from './TransactionsByEachToken';
// import TotalBalances from './TotalBalances';
import { useOrganisation } from '@substrate/app/atoms/organisation/organisationAtom';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';
import { treasuryAnalytics } from '@sdk/polkasafe-sdk/src/treasury-analytics';
import Address from '@common/global-ui-components/Address';
import Loader from '@common/global-ui-components/Loder';
import { ENetwork, ITreasury } from '@common/enum/substrate';
import { CircleArrowDownIcon } from '@common/global-ui-components/Icons';
import TransactionsByEachToken from '@substrate/app/(Main)/treasury-analytics/Components/TransactionsByEachToken';
import AssetsOverview from '@substrate/app/(Main)/dashboard/components/OrganisationDashboard/components/AssetsOverview';

enum EDateFilters {
	YESTERDAY = -1,
	WEEK = -7,
	MONTH = -30,
	QUARTER = -90,
	YEAR = -360,
	ALL = 0
}
// eslint-disable-next-line sonarjs/cognitive-complexity
const TreasuryAnalyticsComponents = () => {
	const [organisation] = useOrganisation();
	const [user] = useUser();

	const [loading, setLoading] = useState<boolean>(false);

	const [treasury, setTreasury] = useState<ITreasury>();

	const fetchTreasuryData = useCallback(async () => {
		if (!user) {
			throw new Error('User not found');
		}

		if (!organisation || !organisation.id) {
			throw new Error('Organisation not found');
		}

		setLoading(true);

		const { data } = (await treasuryAnalytics({
			address: user.address,
			signature: user.signature,
			organisationId: organisation.id,
			multisigs: organisation.multisigs
		})) as { data: ITreasury };

		if (data) {
			setTreasury(data);
			setLoading(false);
		}

		console.log('treasury data', data);
	}, []);

	const [selectedID, setSelectedID] = useState<string>(organisation?.id || '');
	const [startDate, setStartDate] = useState<null | Dayjs>(null);
	const [endDate, setEndDate] = useState<null | Dayjs>(dayjs());
	const [outerDateFilter, setOuterDateFilter] = useState<EDateFilters>(EDateFilters.ALL);

	useEffect(() => {
		fetchTreasuryData();
		setSelectedID(organisation?.id || '');
		setStartDate(null);
		setEndDate(dayjs());
		setOuterDateFilter(EDateFilters.ALL);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organisation]);

	const multisigOptions = organisation?.multisigs?.map((item) => ({
		key: `${item.address}_${item.network}`,
		label: (
			<div className='scale-90 origin-top-left'>
				<Address
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
		key: organisation?.id || '',
		label: (
			<div className='flex items-center gap-x-3'>
				<Image
					width={30}
					height={30}
					className='rounded-full h-[30px] w-[30px]'
					src={organisation?.imageURI || emptyImage}
					alt='empty profile image'
				/>
				<div className='flex flex-col gap-y-[1px]'>
					<span className='text-sm text-white capitalize truncate max-w-[100px]'>{organisation?.name}</span>
					<span className='text-xs text-text_secondary'>{organisation?.members?.length} Members</span>
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
			<div className='flex justify-between items-center max-sm:flex-col'>
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
				<div className='flex gap-x-3 max-sm:flex-col max-sm:gap-2 max-sm:mt-2'>
					<DatePicker.RangePicker
						onChange={onRangeChange}
						value={[startDate, endDate]}
						className='border border-primary shadow-none rounded-lg py-1 pxx-2 bg-highlight min-w-[200px] text-xs max-sm:w-full max-sm:min-w-full'
						presets={rangePresets}
					/>
					<Dropdown
						trigger={['click']}
						className='border border-primary rounded-lg py-1 px-2 bg-bg-secondary cursor-pointer min-w-[200px] text-xs max-sm:w-full max-sm:min-w-full'
						menu={{
							items: multisigOptions,
							onClick: (e) => {
								setSelectedID(e.key);
							}
						}}
					>
						<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
							{selectedID === organisation?.id ? (
								<div className='flex items-center gap-x-3'>
									<Image
										width={20}
										height={20}
										className='rounded-full h-[30px] w-[30px]'
										src={organisation?.imageURI || emptyImage}
										alt='empty profile image'
									/>
									<div>
										<span className='text-sm text-white capitalize truncate max-w-[100px]'>{organisation?.name}</span>
									</div>
								</div>
							) : (
								<Address
									isMultisig
									addressLength={5}
									iconSize={18}
									showNetworkBadge
									network={selectedID.split('_')[1] as ENetwork}
									withBadge={false}
									address={selectedID.split('_')[0]}
								/>
							)}
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</div>
			</div>
			{/* <TotalBalances
				startDate={startDate}
				endDate={endDate}
				onReload={() => refetch(true)}
				incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
				outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
			/> */}
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
			<div className='grid grid-cols-2 gap-x-4 max-sm:hidden'>
				<div>
					<h2 className='text-base font-bold text-white mb-2'>Assets Overview</h2>
					<div className='bg-bg-secondary rounded-xl p-5 shadow-lg'>
						<AssetsOverview />
					</div>
				</div>
				<TransactionsByEachToken
					className='bg-bg-secondary'
					incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
					outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
				/>
			</div>
			<div className='flex flex-col gap-x-4 sm:hidden'>
				<div>
					<h2 className='text-base font-bold text-white mb-2'>Assets Overview</h2>
					<div className='bg-bg-secondary rounded-xl p-8 shadow-lg'>
						<AssetsOverview />
					</div>
				</div>
				<TransactionsByEachToken
					className='bg-bg-secondary'
					incomingTransactions={treasury?.[selectedID]?.incomingTransactions || []}
					outgoingTransactions={treasury?.[selectedID]?.outgoingTransactions || []}
				/>
			</div>
		</div>
	);
};

export default TreasuryAnalyticsComponents;
