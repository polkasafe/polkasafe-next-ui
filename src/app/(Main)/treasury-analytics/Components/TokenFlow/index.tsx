import React from 'react';
import { Divider } from 'antd';
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
		<div className='w-full flex gap-x-12 items-center max-sm:flex-col'>
			<CircularProgressBar
				incomingPercent={incomingPercent}
				outgoingPercent={outgoingPercent}
				outerWidth={200}
				innerWidth={150}
				netBalance={Math.abs(incomingAmount - outgoingAmount)}
			/>
			<div className='flex flex-col items-center max-sm:mt-2'>
				<div className='w-full max-sm:flex max-sm:gap-2'>
					<label className='text-text_secondary text-sm mb-1'>Incoming</label>
					<div className='text-success font-bold text-[18px] xl:text-[22px]'>
						$ {Number.isNaN(Number(incomingAmount)) ? '0.00' : Number(incomingAmount)
							.toFixed(2)
							.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
					</div>
				</div>
				<Divider
					orientation='center'
					className='border border-text_secondary my-2'
				/>
				<div className='w-full max-sm:flex max-sm:gap-2'>
					<label className='text-text_secondary text-sm mb-1'>Outgoing</label>
					<div className='text-failure font-bold text-[18px] xl:text-[22px]'>
						$ {Number.isNaN(Number(outgoingAmount)) ? '0.00' : Number(outgoingAmount)
							.toFixed(2)
							.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TokenFlow;
