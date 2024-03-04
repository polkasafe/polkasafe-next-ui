// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useEffect, useState } from 'react';
import { CircleArrowDownIcon } from '@next-common/ui-components/CustomIcons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import NoAssetsSVG from '@next-common/assets/icons/no-transaction-home.svg';
import { ETxnType, ITreasuryTxns } from '@next-common/types';
import { chainProperties } from '@next-common/global/networkConstants';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { Divider, Dropdown } from 'antd';
import formatBalance from '@next-substrate/utils/formatBalance';
import { ParachainIcon } from '../NetworksDropdown/NetworkCard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ITokenTxnsData {
	balance_token: number;
	balance_usd: number;
	tokenSymbol: string;
	type: ETxnType;
}

interface ITokenData {
	[network: string]: {
		totalTokenAmountIncoming: number;
		totalTokenAmountOutgoing: number;
		totalUsdAmountIncoming: number;
		totalUsdAmountOutgoing: number;
		txns: ITokenTxnsData[];
	};
}

const TransactionsByEachToken = ({
	className,
	incomingTransactions,
	outgoingTransactions
}: {
	className?: string;
	incomingTransactions: ITreasuryTxns[];
	outgoingTransactions: ITreasuryTxns[];
}) => {
	const [tokenTxns, setTokenTxns] = useState<ITokenData>({});

	const [selectedToken, setSelectedToken] = useState<string>();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	useEffect(() => {
		const tokensData: ITokenData = {};
		incomingTransactions.forEach((item) => {
			if (tokensData[item.network] && tokensData[item.network].txns) {
				tokensData[item.network].totalTokenAmountIncoming += Number(item.balance_token);
				tokensData[item.network].totalUsdAmountIncoming += Number(item.balance_usd);
				tokensData[item.network].txns.push({
					balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
					balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
					type: item.type,
					tokenSymbol: chainProperties[item.network].tokenSymbol
				});
				return;
			}
			tokensData[item.network] = {
				totalTokenAmountIncoming: Number(item.balance_token),
				totalUsdAmountIncoming: Number(item.balance_usd),
				totalTokenAmountOutgoing: 0,
				totalUsdAmountOutgoing: 0,
				txns: [
					{
						balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
						balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
						type: item.type,
						tokenSymbol: chainProperties[item.network].tokenSymbol
					}
				]
			};
		});
		outgoingTransactions.forEach((item) => {
			if (tokensData[item.network] && tokensData[item.network].txns) {
				tokensData[item.network].totalTokenAmountOutgoing += Number(item.balance_token);
				tokensData[item.network].totalUsdAmountOutgoing += Number(item.balance_usd);
				tokensData[item.network].txns.push({
					balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
					balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
					type: item.type,
					tokenSymbol: chainProperties[item.network].tokenSymbol
				});
				return;
			}
			tokensData[item.network] = {
				totalTokenAmountIncoming: 0,
				totalUsdAmountIncoming: 0,
				totalTokenAmountOutgoing: Number(item.balance_token),
				totalUsdAmountOutgoing: Number(item.balance_usd),
				txns: [
					{
						balance_token: Number.isNaN(Number(item.balance_token)) ? 0 : Number(item.balance_token),
						balance_usd: Number.isNaN(Number(item.balance_usd)) ? 0 : Number(item.balance_usd),
						type: item.type,
						tokenSymbol: chainProperties[item.network].tokenSymbol
					}
				]
			};
		});
		console.log('tokens data', tokensData);
		setTokenTxns(tokensData);
	}, [incomingTransactions, outgoingTransactions]);

	useEffect(() => {
		if (Object.keys(tokenTxns).length > 0) {
			setSelectedToken(Object.keys(tokenTxns)[0]);
		}
	}, [tokenTxns]);

	const multisigOptions: ItemType[] = Object.keys(tokenTxns)?.map((item) => ({
		key: item,
		label: (
			<div className='flex items-center gap-x-2'>
				<ParachainIcon
					src={chainProperties[item].logo}
					size={10}
				/>
				<span className='text-white'>{chainProperties[item].tokenSymbol}</span>
			</div>
		)
	}));

	const tokenIncomingtxns = tokenTxns[selectedToken]?.txns?.filter((item) => item.type === ETxnType.INCOMING).length;
	const tokenOutgoingTxns = tokenTxns[selectedToken]?.txns?.filter((item) => item.type === ETxnType.OUTGOING).length;

	const diff = Math.abs(tokenIncomingtxns - tokenOutgoingTxns);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const textCenter = {
		id: 'textCenter',
		beforeDatasetsDraw(chart: any) {
			const { ctx } = chart;
			ctx.save();

			const xCoor = chart.getDatasetMeta(0).data[0].x;
			const yCoor = chart.getDatasetMeta(0).data[0].y;
			ctx.font = 'bold 20px sans-serif';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.baseline = 'middle';
			ctx.fillText(
				`$ ${formatBalance(
					tokenTxns[selectedToken]
						? tokenTxns[selectedToken].totalUsdAmountIncoming - tokenTxns[selectedToken].totalUsdAmountOutgoing
						: 0
				)}`,
				xCoor,
				yCoor
			);
		}
	};

	const data = {
		datasets: [
			{
				label: 'Outgoing Transactions',
				data: [tokenOutgoingTxns, diff],
				backgroundColor: ['#E63946', '#1B2028'],
				borderWidth: 10,
				cutout: 50,
				borderRadius: 10,
				borderColor: '#24272E'
			},
			{
				label: 'Incoming Transactions',
				data: [tokenIncomingtxns, diff],
				backgroundColor: ['#06D6A0', '#1B2028'],
				borderColor: '#24272E',
				borderWidth: 10,
				cutout: 50,
				borderRadius: 10
			}
		]
	};

	return (
		<div>
			<div className='flex justify-between flex-row w-full mb-2'>
				<h2 className='text-base font-bold text-white'>Token Flow</h2>
				<Dropdown
					trigger={['click']}
					className='border border-primary rounded-lg p-1 bg-bg-secondary cursor-pointer min-w-[150px]'
					menu={{
						items: multisigOptions,
						onClick: (e) => {
							setSelectedToken(e.key);
						}
					}}
				>
					<div className='flex justify-between gap-x-4 items-center text-white text-[16px]'>
						<div className='flex items-center gap-x-2'>
							<ParachainIcon
								src={chainProperties[selectedToken]?.logo}
								size={10}
							/>
							<span className='text-xs'>{chainProperties[selectedToken]?.tokenSymbol}</span>
						</div>
						<CircleArrowDownIcon className='text-primary' />
					</div>
				</Dropdown>
			</div>
			{!tokenTxns ? (
				<div
					className={`bg-bg-main relative flex flex-col justify-around rounded-xl p-8 h-[17rem] shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<div className='flex flex-col gap-y-2 items-center justify-center'>
						<NoAssetsSVG />
						<p className='font-normal text-xs leading-[15px] text-text_secondary'>No Assets Found.</p>
					</div>
				</div>
			) : (
				<div
					className={`bg-bg-main relative flex items-center rounded-xl p-8 shadow-lg scale-90 w-[111%] origin-top-left ${className}`}
				>
					<div className='h-[190px] w-[400px]'>
						<Doughnut
							data={data}
							// plugins={[textCenter]}
							options={{
								maintainAspectRatio: false,
								plugins: {
									legend: {
										display: false
									}
								}
							}}
						/>
					</div>
					<div className='flex flex-col items-center'>
						<div>
							<label className='text-text_secondary text-sm mb-1'>Incoming</label>
							<div className='text-success font-bold text-[22px]'>
								$ {formatBalance(tokenTxns[selectedToken]?.totalUsdAmountIncoming)}
							</div>
						</div>
						<Divider
							orientation='center'
							className='border border-text_secondary my-2 w-[130%]'
						/>
						<div>
							<label className='text-text_secondary text-sm mb-1'>Outgoing</label>
							<div className='text-failure font-bold text-[22px]'>
								$ {formatBalance(tokenTxns[selectedToken]?.totalUsdAmountOutgoing)}
							</div>
						</div>
						<Divider
							orientation='center'
							className='border border-text_secondary my-2 w-[130%]'
						/>
						<div>
							<label className='text-text_secondary text-sm mb-1'>Net</label>
							<div className='text-white font-bold text-[22px]'>
								${' '}
								{formatBalance(
									tokenTxns[selectedToken]
										? tokenTxns[selectedToken].totalUsdAmountIncoming - tokenTxns[selectedToken].totalUsdAmountOutgoing
										: 0
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TransactionsByEachToken;
