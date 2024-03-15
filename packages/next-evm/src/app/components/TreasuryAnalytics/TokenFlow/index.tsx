import React from 'react';
import { Divider } from 'antd';
import formatBalance from '@next-evm/utils/formatBalance';
import CircularProgressBar from './CircularProgressBar';
import './style.css';

const TokenFlow = ({
	incomingAmount,
	outgoingAmount,
	numberOfIncoming,
	numberOfOutgoing
}: {
	incomingAmount: number;
	outgoingAmount: number;
	numberOfIncoming: number;
	numberOfOutgoing: number;
}) => {
	const incomingPercent = (numberOfIncoming / (numberOfIncoming + numberOfOutgoing)) * 100;
	const outgoingPercent = (numberOfOutgoing / (numberOfIncoming + numberOfOutgoing)) * 100;

	return (
		<div className='w-full flex gap-x-12 items-center'>
			<CircularProgressBar
				incomingPercent={incomingPercent}
				outgoingPercent={outgoingPercent}
				outerWidth={250}
				innerWidth={200}
				netBalance={incomingAmount - outgoingAmount}
			/>
			<div className='flex flex-col items-center'>
				<div className='w-full'>
					<label className='text-text_secondary text-sm mb-1'>Incoming</label>
					<div className='text-success font-bold text-[18px] xl:text-[22px]'>$ {formatBalance(incomingAmount)}</div>
				</div>
				<Divider
					orientation='center'
					className='border border-text_secondary my-2'
				/>
				<div className='w-full'>
					<label className='text-text_secondary text-sm mb-1'>Outgoing</label>
					<div className='text-failure font-bold text-[18px] xl:text-[22px]'>$ {formatBalance(outgoingAmount)}</div>
				</div>
			</div>
		</div>
	);
};

export default TokenFlow;
