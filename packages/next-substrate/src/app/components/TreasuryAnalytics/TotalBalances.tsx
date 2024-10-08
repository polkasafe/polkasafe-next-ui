import { ITreasuryTxns } from '@next-common/types';
import { SyncOutlined } from '@ant-design/icons';
import formatBalance from '@next-substrate/utils/formatBalance';
import { Button, Divider } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

const TotalBalances = ({
	incomingTransactions,
	outgoingTransactions,
	startDate,
	endDate,
	onReload
}: {
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
	startDate: null | Dayjs;
	endDate: null | Dayjs;
	onReload: () => void;
}) => {
	const filterredIncomingTxns =
		startDate && endDate
			? incomingTransactions.filter(
					(item) => dayjs(item.timestamp).isBefore(dayjs(endDate)) && dayjs(item.timestamp).isAfter(dayjs(startDate))
				)
			: incomingTransactions;

	const filterredOutgoingTxns =
		startDate && endDate
			? outgoingTransactions.filter(
					(item) => dayjs(item.timestamp).isBefore(dayjs(endDate)) && dayjs(item.timestamp).isAfter(dayjs(startDate))
				)
			: outgoingTransactions;

	const totalIncoming = filterredIncomingTxns.reduce((sum, item) => sum + Number(item.balance_usd), 0);
	const totalOutgoing = filterredOutgoingTxns.reduce((sum, item) => sum + Number(item.balance_usd), 0);

	return (
		<div className='relative'>
			<Button
				size='small'
				onClick={onReload}
				className='text-primary outline-none border-none font-medium text-[8px] top-1 right-1 absolute sm:hidden'
			>
				<SyncOutlined className='text-primary' />
			</Button>
			<div className='rounded-xl p-5 bg-bg-secondary flex gap-x-5 max-sm:p-3 max-sm:gap-x-2'>
				<div>
					<label className='text-text_secondary text-xs mb-1.5'>Incoming</label>
					<div className='text-success font-bold text-[22px] max-sm:text-[16px]'>
						$ {totalIncoming ? formatBalance(totalIncoming) : '0.00'}
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
					<div className='text-failure font-bold text-[22px] max-sm:text-[16px]'>
						$ {totalOutgoing ? formatBalance(totalOutgoing) : '0.00'}
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
					<div className='text-white font-bold text-[22px] max-sm:text-[16px]'>
						$ {formatBalance(totalIncoming - totalOutgoing)}
					</div>
				</div>
				<div className='flex-1' />
				<Button
					onClick={onReload}
					icon={<SyncOutlined className='text-primary' />}
					className='text-primary bg-highlight outline-none border-none font-medium text-sm max-sm:hidden'
				>
					Refresh
				</Button>
			</div>
		</div>
	);
};

export default TotalBalances;
