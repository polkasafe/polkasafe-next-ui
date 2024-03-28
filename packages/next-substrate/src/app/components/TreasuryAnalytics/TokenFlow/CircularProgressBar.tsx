/* eslint-disable sort-keys */
import formatBalance from '@next-substrate/utils/formatBalance';
import React from 'react';

const CircularProgressBar = ({
	outerWidth,
	innerWidth,
	netBalance,
	incomingPercent,
	outgoingPercent
}: {
	outerWidth: number;
	innerWidth: number;
	netBalance: number;
	incomingPercent: number;
	outgoingPercent: number;
}) => {
	const outerRadius = outerWidth / 2 - 15;
	const innerRadius = innerWidth / 2 - 15;

	const dashArrayOuter = outerRadius * Math.PI * 2;
	const dashOffsetOuter = dashArrayOuter - (dashArrayOuter * outgoingPercent) / 100;

	const dashArrayInner = innerRadius * Math.PI * 2;
	const dashOffsetInner = dashArrayInner - (dashArrayInner * incomingPercent) / 100;
	return (
		<div className='relative rounded-full bg-[#2F3239]'>
			<div>
				<svg
					width={outerWidth}
					height={outerWidth}
					viewBox={`0 0 ${outerWidth} ${outerWidth}`}
				>
					<circle
						cx={outerWidth / 2}
						cy={outerWidth / 2}
						strokeWidth='15px'
						r={outerRadius}
						className='circle-background'
					/>
					<circle
						cx={outerWidth / 2}
						cy={outerWidth / 2}
						strokeWidth='15px'
						r={outerRadius}
						className='circle-progress-outer'
						style={{ strokeDasharray: dashArrayOuter, strokeDashoffset: dashOffsetOuter }}
						transform={`rotate(-90 ${outerWidth / 2} ${outerWidth / 2})`}
					/>
				</svg>
			</div>
			<div
				className='absolute'
				style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
			>
				<svg
					width={innerWidth}
					height={innerWidth}
					viewBox={`0 0 ${innerWidth} ${innerWidth}`}
				>
					<circle
						cx={innerWidth / 2}
						cy={innerWidth / 2}
						strokeWidth='15px'
						r={innerRadius}
						className='circle-background'
					/>
					<circle
						cx={innerWidth / 2}
						cy={innerWidth / 2}
						strokeWidth='15px'
						r={innerRadius}
						className='circle-progress-inner'
						style={{ strokeDasharray: dashArrayInner, strokeDashoffset: dashOffsetInner }}
						transform={`rotate(-90 ${innerWidth / 2} ${innerWidth / 2})`}
					/>
				</svg>
			</div>
			<div
				className='absolute flex flex-col items-center'
				style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
			>
				<label className='text-text_secondary text-xs mb-1'>Net Balance</label>
				<div className='text-white font-bold text-[18px]'>$ {formatBalance(netBalance || 0)}</div>
			</div>
		</div>
	);
};

export default CircularProgressBar;
